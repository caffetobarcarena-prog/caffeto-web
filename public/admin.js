import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL="https://dzyqcvvrdfgtukkkdeql.supabase.co";
const SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6eXFjdnZyZGZndHVra2tkZXFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDk5MTEsImV4cCI6MjA4NTQ4NTkxMX0.l_r4NHuJIcSomBf2_sAiUgb3ah6nzRLYF-UXv4uYcRE";

const supabase=createClient(SUPABASE_URL,SUPABASE_KEY);

const box=document.getElementById("reportBox");

window.loadDaily=async()=>{
 const { data,error }=await supabase
  .from("report_daily_sales")
  .select("*");

 if(error) return alert(error.message);
 render(data);
};

window.loadTop=async()=>{
 const { data,error }=await supabase
  .from("report_top_customers")
  .select("*");

 if(error) return alert(error.message);
 render(data);
};

window.exportCSV=async()=>{
 const { data,error }=await supabase
  .from("orders")
  .select("created_at,total,status,customers(name,phone)")
  .eq("status","confirmed");

 if(error) return alert(error.message);

 let csv="Data,Cliente,Telefone,Total\n";

 data.forEach(o=>{
  csv+=`${o.created_at},${o.customers.name},${o.customers.phone},${o.total}\n`;
 });

 const blob=new Blob([csv],{type:"text/csv"});
 const a=document.createElement("a");
 a.href=URL.createObjectURL(blob);
 a.download="caffeto-relatorio.csv";
 a.click();
};

function render(rows){

 if(!rows.length){
  box.innerHTML="Sem dados";
  return;
 }

 const cols=Object.keys(rows[0]);

 let html="<table><tr>";
 cols.forEach(c=>html+=`<th>${c}</th>`);
 html+="</tr>";

 rows.forEach(r=>{
  html+="<tr>";
  cols.forEach(c=>html+=`<td>${r[c]??""}</td>`);
  html+="</tr>";
 });

 html+="</table>";
 box.innerHTML=html;
}
