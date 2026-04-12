"use server";

import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

export async function createService(formData: FormData) {
  const supabase = getAdminClient();

  const categoryId = formData.get("category_id");

  const { error } = await supabase.from("services").insert({
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    category_id: categoryId ? Number(categoryId) : null,
    description: (formData.get("description") as string) || null,
    website_url: (formData.get("website_url") as string) || null,
    affiliate_url: (formData.get("affiliate_url") as string) || null,
    logo_url: (formData.get("logo_url") as string) || null,
    is_featured: formData.get("is_featured") === "on",
    is_active: formData.get("is_active") === "on",
  });

  if (error) throw new Error(error.message);
  redirect("/admin/services");
}

export async function updateService(id: string, formData: FormData) {
  const supabase = getAdminClient();

  const categoryId = formData.get("category_id");

  const { error } = await supabase
    .from("services")
    .update({
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      category_id: categoryId ? Number(categoryId) : null,
      description: (formData.get("description") as string) || null,
      website_url: (formData.get("website_url") as string) || null,
      affiliate_url: (formData.get("affiliate_url") as string) || null,
      logo_url: (formData.get("logo_url") as string) || null,
      is_featured: formData.get("is_featured") === "on",
      is_active: formData.get("is_active") === "on",
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  redirect("/admin/services");
}
