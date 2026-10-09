async function check() {
  try {
    const res = await fetch("https://ecokit-admin-igfjgczga-adeshpatel700-8202s-projects.vercel.app/admin/login");
    console.log("STATUS:", res.status);
    const text = await res.text();
    console.log(text.slice(0, 500));
  } catch(e) {
    console.error("Fetch failed", e);
  }
}
check();
