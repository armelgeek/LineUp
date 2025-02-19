"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from '@/auth';
import { service } from "@/drizzle/schema/service";
import { db } from "@/drizzle/db";
import { company } from "@/drizzle/schema/company";
import { and, desc, eq, inArray } from "drizzle-orm";
import { ticket } from "@/drizzle/schema/ticket";
import { post } from "@/drizzle/schema/post";
export async function updateName(data: FormData) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  try {
    const value = data.get("value") as string;
    if (!value || value === session?.user.name) return;
    await auth.api.updateUser({ headers: h, body: { name: value } });
    revalidatePath("/", "layout");
  } catch {}
}

export async function updateAvatar(path: string) {
  const h = await headers();
  try {
    await auth.api.updateUser({ header: h, body: { image: path } });
    revalidatePath("/", "layout");
  } catch {

  }
}

export async function updateUsername(data: FormData) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  try {
    const value = data.get("value") as string;
    if (!value || value === session?.user.username) return;
    await auth.api.updateUser({ headers: h, body: { username: value } });
    revalidatePath("/", "layout");
  } catch {}
}

export async function updateEmail(data: FormData) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  try {
    const value = data.get("value") as string;
    if (!value || value === session?.user.email) return;
    await auth.api.changeEmail({ headers: h, body: { newEmail: value } });
    revalidatePath("/", "layout");
  } catch {}
}

export async function updatePassword(data: FormData) {
  const h = await headers();
  try {
    const currentPassword = data.get("currentPassword") as string;
    const newPassword = data.get("newPassword") as string;
    await auth.api.changePassword({
      headers: h,
      body: { newPassword: newPassword, currentPassword: currentPassword },
    });
  } catch {}
}

export async function deleteAccount(data: FormData) {
  const h = await headers();
  try {
    const password = data.get("value") as string;
    await auth.api.deleteUser({ headers: h, body: { password } });
    revalidatePath("/", "layout");
  } catch {}
}


export async function checkAndAddUser(email: string, name: string) {
    if (!email) return;
    try {
        const existingUser = await db.select().from(company).where(eq(company.email, email));

        if (!existingUser.length && name) {
            await db.insert(company).values({ email, name });
        }
    } catch (error) {
        console.error(error);
    }
}

export async function createService(email: string, serviceName: string, avgTime: number) {
    if (!email || !serviceName || avgTime == null) return;
    try {
        const existingCompany = await db.select().from(company).where(eq(company.email, email));

        if (existingCompany.length) {
            await db.insert(service).values({
                name: serviceName,
                avgTime,
                companyId: existingCompany[0].id
            });
        } else {
            console.log(`No company found with email: ${email}`);
        }
    } catch (error) {
        console.error(error);
    }
}

export async function getServicesByEmail(email: string) {
    if (!email) return;
    try {
        const comp = await db.select().from(company).where(eq(company.email, email));

        if (!comp.length) {
            throw new Error('Aucune entreprise trouvée avec cet email');
        }

        return await db.select().from(service).where(eq(service.companyId, comp[0].id));
    } catch (error) {
        console.error(error);
    }
}

export async function deleteServiceById(serviceId: string) {
    if (!serviceId) return;
    try {
        await db.delete(service).where(eq(service.id, serviceId.toString()));
    } catch (error) {
        console.error(error);
    }
}

export async function createPost(email: string, postName: string) {
    try {
        const comp = await db.select().from(company).where(eq(company.email, email));

        if (!comp.length) {
            throw new Error(`Aucune entreprise trouvée avec cet email`);
        }

        await db.insert(post).values({
            name: postName,
            companyId: comp[0].id
        });
    } catch (error) {
        console.error(error)
    }
}

export async function deletePost(postId: string) {
    try {
        await db.delete(post).where(eq(post.id, postId));
    } catch (error) {
        console.error(error)
    }
}

export async function getPostsByCompanyEmail(email: string) {
    try {
        const comp = await db.select().from(company).where(eq(company.email, email));

        if (!comp.length) {
            throw new Error(`Aucune entreprise trouvée avec cet email`);
        }

        const posts = await db.select().from(post).where(eq(post.companyId, comp[0].id));
        return posts

    } catch (error) {
        console.error(error)
    }
}

export async function getPostNameById(postId: string) {
    try {
        const pt = await db.select({ name: post.name }).from(post).where(eq(post.id, postId));

        if (pt.length) {
            return pt[0].name
        } else {
            throw new Error('Poste non trouvé');
        }
    } catch (error) {
        console.error(error)
    }
}


export async function getCompanyPageName(email: string) {
    try {
        const comp = await db.select({ pageName: company.pageName }).from(company).where(eq(company.email, email));
        return comp.length ? comp[0].pageName : null;
    } catch (error) {
        console.error(error);
    }
}

export async function setCompanyPageName(email: string, pageName: string) {
    try {
        await db.update(company).set({ pageName }).where(eq(company.email, email));
    } catch (error) {
        console.error(error);
    }
}

export async function getServicesByPageName(pageName: string) {
    try {
        const comp = await db.select().from(company).where(eq(company.pageName, pageName));

        if (!comp.length) throw new Error(`Aucune entreprise trouvée avec le nom de page : ${pageName}`);

        return await db.select().from(service).where(eq(service.companyId, comp[0].id));
    } catch (error) {
        console.error(error);
    }
}

export async function createTicket(serviceId: string, nameComplete: string) {
    try {
        const ticketNum = `A${Math.floor(Math.random() * 10000)}`;
        await db.insert(ticket).values({ serviceId, nameComplete, num: ticketNum, status: "PENDING" });
        return ticketNum;
    } catch (error) {
        console.error(error);
    }
}
export async function getPendingTicketsByEmail(email: string) {
    try {
        const results = await db
            .select({
                ticket: {
                    id: ticket.id,
                    serviceId: ticket.serviceId,
                    num: ticket.num,
                    nameComplete: ticket.nameComplete,
                    status: ticket.status,
                    createdAt: ticket.createdAt,
                    postId: ticket.postId,
                    postName: ticket.postName,
                },
                service: {
                    name: service.name,
                    avgTime: service.avgTime,
                },
                post: {
                    id: post.id,
                    name: post.name,
                },
            })
            .from(ticket)
            .innerJoin(service, eq(ticket.serviceId, service.id))
            .innerJoin(company, eq(service.companyId, company.id))
            .leftJoin(post, eq(ticket.postId, post.id))
            .where(
                and(
                    eq(company.email, email),
                    inArray(ticket.status, ["PENDING", "CALL", "IN_PROGRESS"])
                )
            )
            .orderBy(ticket.createdAt);

        if (!results.length) {
            throw new Error(`Aucune entreprise trouvée avec l'email : ${email}`);
        }

        const pendingTickets = results.map(({ ticket, service, post: p }) => ({
            ...ticket,
            serviceName: service.name,
            avgTime: service.avgTime,
            post: p ? p : null,
        }));

        return pendingTickets;
    } catch (error) {
        console.error(error);
    }
}


export async function getTicketsByIds(ticketNums: string[]) {
  try {
    const results = await db
      .select({
        ticket: ticket,
        service: service,
        post: post
      })
      .from(ticket)
      .leftJoin(service, eq(ticket.serviceId, service.id))
      .leftJoin(post, eq(ticket.postId, post.id))
      .where(inArray(ticket.num, ticketNums))
      .orderBy(ticket.createdAt);

    if (results.length === 0) {
      throw new Error('Aucun ticket trouvé');
    }

    return results.map(({ ticket, service: srv, post }) => ({
      ...ticket,
      serviceName: srv?.name || 'Unknown Service',
      avgTime: srv?.avgTime || 0,
      post
    }));
  } catch (error) {
    console.error(error);
    throw error; 
  }
}

export async function getLastTicketByEmail(email: string, idPoste: string) {
    try {
        const existingTicket = await db.select()
            .from(ticket)
            .leftJoin(service, eq(ticket.serviceId, service.id))
            .leftJoin(post, eq(ticket.postId, post.id))
            .where(and(
                eq(ticket.postId, idPoste),
                inArray(ticket.status, ["CALL", "IN_PROGRESS"])
            ))
            .orderBy(desc(ticket.createdAt))
            .limit(1);

        if (existingTicket.length > 0 && existingTicket[0].service) {
            return {
                ...existingTicket[0].ticket,
                serviceName: existingTicket[0].service.name,
                avgTime: existingTicket[0].service.avgTime
            };
        }

        const pendingTicket = await db.select()
            .from(ticket)
            .leftJoin(service, eq(ticket.serviceId, service.id))
            .leftJoin(company, eq(service.companyId, company.id))
            .where(and(
                eq(ticket.status, "PENDING"),
                eq(company.email, email)
            ))
            .orderBy(desc(ticket.createdAt))
            .limit(1);

        if (pendingTicket.length === 0 || !pendingTicket[0].service) return null;

        const postResult = await db.select()
            .from(post)
            .where(eq(post.id, idPoste))
            .limit(1);

        if (postResult.length === 0) {
            console.error(`Aucun poste trouvé pour l'ID: ${idPoste}`);
            return null;
        }

        const updatedTicket = await db.update(ticket)
            .set({
                status: "CALL",
                postId: postResult[0].id,
                postName: postResult[0].name
            })
            .where(eq(ticket.id, pendingTicket[0].ticket.id))
            .returning();

        if (updatedTicket.length === 0) return null;

        return {
            ...updatedTicket[0],
            serviceName: pendingTicket[0].service.name,
            avgTime: pendingTicket[0].service.avgTime
        };
    } catch (error) {
        console.error(error);
    }
}


export async function updateTicketStatus(ticketId: string, newStatus: string) {
    try {
        await db.update(ticket).set({ status: newStatus }).where(eq(ticket.id, ticketId));
    } catch (error) {
        console.error(error);
    }
}

export async function get10LstFinishedTicketsByEmail(email: string) {
    try {
        const results = await db
            .select({
                id: ticket.id,
                num: ticket.num,
                nameComplete: ticket.nameComplete,
                status: ticket.status,
                createdAt: ticket.createdAt,
                serviceName: service.name,
                avgTime: service.avgTime,
            })
            .from(ticket)
            .innerJoin(service, eq(ticket.serviceId, service.id))
            .innerJoin(company, eq(service.companyId, company.id))
            .where(and(eq(ticket.status, "FINISHED"), eq(company.email, email)))
            .orderBy(ticket.createdAt)
            .limit(10);

        return results;
    } catch (error) {
        console.error(error);
    }
}

export async function getTicketStatsByEmail(email: string) {
    try {
        const results = await db
            .select({ status: ticket.status })
            .from(ticket)
            .innerJoin(service, eq(ticket.serviceId, service.id))
            .innerJoin(company, eq(service.companyId, company.id))
            .where(eq(company.email, email));

        const totalTickets = results.length;
        const resolvedTickets = results.filter(ticket => ticket.status === "FINISHED").length;
        const pendingTickets = results.filter(ticket => ticket.status === "PENDING").length;

        return { totalTickets, resolvedTickets, pendingTickets };
    } catch (error) {
        console.error(error);
        return { totalTickets: 0, resolvedTickets: 0, pendingTickets: 0 };
    }
}