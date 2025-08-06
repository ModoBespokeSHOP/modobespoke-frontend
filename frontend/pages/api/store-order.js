import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method === "POST") {
    const orderId = Date.now().toString();
    const { error } = await supabase
      .from("orders")
      .insert([{ id: orderId, data: req.body }]);

    if (error) {
      console.error("Ошибка при сохранении заказа:", error);
      return res.status(500).json({ message: "Failed to save order" });
    }

    res.status(200).json({ orderId });
  } else if (req.method === "GET") {
    const orderId = req.query.id;
    const { data, error } = await supabase
      .from("orders")
      .select("data")
      .eq("id", orderId)
      .single();

    if (error || !data) {
      console.error("Ошибка при получении заказа:", error);
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(data.data);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
