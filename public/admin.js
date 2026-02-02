import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL="https://dzyqcvvrdfgtukkkdeql.supabase.co";
const SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6eXFjdnZyZGZndHVra2tkZXFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MDk5MTEsImV4cCI6MjA4NTQ4NTkxMX0.l_r4NHuJIcSomBf2_sAiUgb3ah6nzRLYF-UXv4uYcRE";

const supabase=createClient(SUPABASE_URL,SUPABASE_KEY);

let session=null;
let chart;

window.login=async()=>{

 const { data,error }=await supabase.auth.signInWithPassword({
  email:email.value,
  password:password.value
 });

 if(error) return alert(error.message);

 session=data.session;
 loginBox.classList.add("hidden");
 dashboard.classList.remove("hidden");

 loadReports();
};

async function loadReports(){

 const { data,error }=await supabase
  .from("report_daily_sales")
  .select("*");

 if(error) return alert(error.message);

 renderChart(data);

 const dash=await supabase
  .from("report_dashboard")
  .select("*")
  .single();

 metrics.innerHTML=`
 Total pedidos: ${dash.data.total_orders}<br>
 Faturamento: R$ ${dash.data.revenue}<br>
 Ticket médio: R$ ${dash.data.avg_ticket}
 `;
}

function renderChart(rows){

 const labels=rows.map(r=>r.day);
 const values=rows.map(r=>r.revenue);

 if(chart) chart.destroy();

 chart=new Chart(document.getElementById("chart"),{
  type:"line",
  data:{
   labels,
   datasets:[{
     label:"Receita",
     data:values,
     borderColor:"#6b3e1d"
   }]
  }
 });
}
