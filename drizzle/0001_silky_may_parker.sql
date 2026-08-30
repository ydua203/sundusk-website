CREATE TABLE "customization_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid,
	"product_name" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"bust_in" integer,
	"waist_in" integer,
	"hips_in" integer,
	"notes" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"admin_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "customization_requests_status_check" CHECK ("customization_requests"."status" in ('new', 'contacted', 'closed')),
	CONSTRAINT "customization_requests_measurements_check" CHECK (
        ("customization_requests"."bust_in" is null or "customization_requests"."bust_in" between 20 and 70) and
        ("customization_requests"."waist_in" is null or "customization_requests"."waist_in" between 20 and 70) and
        ("customization_requests"."hips_in" is null or "customization_requests"."hips_in" between 20 and 70)
      )
);
--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_totals_nonnegative_check";--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "discount_paise" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "promo_code" text;--> statement-breakpoint
ALTER TABLE "customization_requests" ADD CONSTRAINT "customization_requests_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_totals_nonnegative_check" CHECK (
      "orders"."subtotal_paise" >= 0 and
      "orders"."shipping_paise" >= 0 and
      "orders"."discount_paise" >= 0 and
      "orders"."gst_paise" >= 0 and
      "orders"."total_paise" >= 0
    );