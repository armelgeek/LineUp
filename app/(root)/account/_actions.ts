"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from '@/auth';
import { service } from "@/drizzle/schema/service";
import { db } from "@/drizzle/db";
import { company } from "@/drizzle/schema/company";
import { and, eq, inArray } from "drizzle-orm";
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

export async function deleteServiceById(serviceId: number) {
    if (!serviceId) return;
    try {
        await db.delete(service).where(eq(service.id, serviceId.toString()));
    } catch (error) {
        console.error(error);
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
        const comp = await db.select().from(company).where(eq(company.email, email));
        if (!comp.length) throw new Error(`Aucune entreprise trouvée avec cet email`);

        const services = await db.select().from(service).where(eq(service.companyId, comp[0].id));
        const serviceIds = services.map(s => s.id);

        return await db.select().from(ticket).where(inArray(ticket.serviceId, serviceIds)).orderBy(ticket.createdAt);
    } catch (error) {
        console.error(error);
    }
}


export async function getTicketsByIds(ticketNums: string[]) {
    try {
        const tickets = await db
            .select({
                id: ticket.id,
                num: ticket.num,
                nameComplete: ticket.nameComplete,
                status: ticket.status,
                createdAt: ticket.createdAt,
                serviceName: service.name,
                avgTime: service.avgTime,
                postId: ticket.postId,
                postName: post.name
            })
            .from(ticket)
            .innerJoin(service, eq(ticket.serviceId, service.id))
            .innerJoin(post, eq(ticket.postId, post.id))
            .where(inArray(ticket.num, ticketNums))
            .orderBy(ticket.createdAt);

        if (!tickets.length) {
            throw new Error('Aucun ticket trouvé');
        }
        return tickets;
    } catch (error) {
        console.error(error);
    }
}

export async function getLastTicketByEmail(email: string, idPoste: string) {
    try {
        const existingTicket = await db.select({
            id: ticket.id,
            num: ticket.num,
            nameComplete: ticket.nameComplete,
            status: ticket.status,
            createdAt: ticket.createdAt,
            serviceName: service.name,
            avgTime: service.avgTime,
            postId: ticket.postId,
            postName: post.name
        })
            .from(ticket)
            .innerJoin(service, eq(ticket.serviceId, service.id))
            .innerJoin(post, eq(ticket.postId, post.id))
            .where(and(
                eq(post.id, idPoste),
                inArray(ticket.status, ['CALL', 'IN_PROGRESS'])
            ))
            //.orderBy(ticket.createdAt, 'desc')
            .limit(1);

        if (!existingTicket.length) {
            const tk = await db.select({
                id: ticket.id,
                num: ticket.num,
                nameComplete: ticket.nameComplete,
                status: ticket.status,
                createdAt: ticket.createdAt,
                serviceName: service.name,
                avgTime: service.avgTime,
                postId: ticket.postId,
                postName: post.name
            })
                .from(ticket)
                .innerJoin(service, eq(ticket.serviceId, service.id))
                .innerJoin(post, eq(ticket.postId, post.id))
                .where(and(
                    eq(service.companyId, email),
                    eq(ticket.status, 'PENDING')
                ))
                .orderBy(ticket.createdAt)
                .limit(1);

            if (!tk.length) {
                return null;
            }

            const pt = await db.select().from(post).where(eq(post.id, idPoste));

            if (!pt.length) {
                console.error(`Aucun poste trouvé pour l'ID: ${idPoste}`);
                return null;
            }

            const updatedTicket = await db.update(ticket)
                .set({
                    status: 'CALL',
                    postId: pt[0].id,
                    postName: pt[0].name
                })
                .where(eq(ticket.id, tk[0].id))
                .returning();

            return {
                ...updatedTicket,
                serviceName: '',
                avgTime: ''
            };
        }

        return existingTicket[0];
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