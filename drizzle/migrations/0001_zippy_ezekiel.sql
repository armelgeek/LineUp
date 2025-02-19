CREATE TABLE "company" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"page_name" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "company_email_unique" UNIQUE("email"),
	CONSTRAINT "company_page_name_unique" UNIQUE("page_name")
);
--> statement-breakpoint
CREATE TABLE "post" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"company_id" varchar(36) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "service" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"avg_time" integer NOT NULL,
	"company_id" varchar(36) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_id" varchar(36) NOT NULL,
	"num" text NOT NULL,
	"name_complete" text NOT NULL,
	"status" text DEFAULT 'PENDING',
	"created_at" timestamp DEFAULT now(),
	"post_id" varchar(36),
	"post_name" text,
	CONSTRAINT "ticket_num_unique" UNIQUE("num")
);
--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "post_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service" ADD CONSTRAINT "service_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_service_id_service_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."service"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;