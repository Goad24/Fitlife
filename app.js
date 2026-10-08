const DBKEY="fitlifeDB_v3";
const ADMIN_EMAIL="admin@fitlife.com", ADMIN_PASS="admin123";

const defaultProducts=[
{id:1,name:"Whey Protein",category:"Protein",price:2499,img:"🥛",desc:"Demo whey protein product for the fitness store."},
{id:2,name:"Creatine Monohydrate",category:"Performance",price:899,img:"⚡",desc:"Demo creatine product. Use only when appropriate for you."},
{id:3,name:"Daily Multivitamin",category:"Vitamins",price:699,img:"💊",desc:"Demo multivitamin product; check suitability with a professional."},
{id:4,name:"Weight Gainer",category:"Gainer",price:1799,img:"🥤",desc:"Demo calorie-support product."},
{id:5,name:"Testosterone Support",category:"Fitness Support",price:1499,img:"🧴",desc:"Demo product only. Consult a qualified professional before use."},
{id:6,name:"Resistance Bands",category:"Accessories",price:499,img:"🏋️",desc:"Home workout resistance bands."}
];

function db(){
  let x=JSON.parse(localStorage.getItem(DBKEY)||"null");
  if(!x){
    const old=JSON.parse(localStorage.getItem("fitlifeDB_v2")||"null");
    x=old||{users:[],products:defaultProducts,orders:[],visits:0,reminders:[]};
  }
  x.users=x.users||[]; x.orders=x.orders||[]; x.reminders=x.reminders||[]; x.visits=x.visits||0;
  if(!x.products?.length)x.products=defaultProducts;
  return x;
}
function save(x){localStorage.setItem(DBKEY,JSON.stringify(x))}
function current(){return JSON.parse(localStorage.getItem("fitlifeCurrentUser")||"null")}
function setCurrent(u){localStorage.setItem("fitlifeCurrentUser",JSON.stringify(u))}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function toast(msg){
  let b=document.getElementById("toastBox");
  if(!b){b=document.createElement("div");b.id="toastBox";document.body.appendChild(b)}
  b.innerHTML=`<div class="toast-custom">${esc(msg)}</div>`;
  clearTimeout(window.fitToastTimer); window.fitToastTimer=setTimeout(()=>b.innerHTML="",2800);
}
function nav(){
  const u=current(),el=document.getElementById("nav"); if(!el)return;
  el.innerHTML=`<nav class="navbar navbar-expand-lg navbar-dark sticky-top"><div class="container">
  <a class="navbar-brand fw-bold" href="index.html"><i class="bi bi-heart-pulse-fill"></i> FitLife</a>
  <button class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#navMenu"><span class="navbar-toggler-icon"></span></button>
  <div class="collapse navbar-collapse" id="navMenu"><ul class="navbar-nav ms-auto align-items-lg-center">
  <li><a class="nav-link" href="index.html">Home</a></li><li><a class="nav-link" href="planner.html">Planner</a></li>
  <li><a class="nav-link" href="dashboard.html">Dashboard</a></li><li><a class="nav-link" href="reminders.html">Reminders</a></li>
  <li><a class="nav-link" href="shop.html">Store</a></li><li><a class="nav-link" href="orders.html">Orders</a></li>
  ${u?.email===ADMIN_EMAIL?`<li><a class="nav-link" href="admin.html">Admin</a></li>`:""}
  <li class="ms-lg-2 mt-2 mt-lg-0">${u?`<button class="btn btn-sm btn-outline-light" onclick="logout()">Logout (${esc(u.name.split(" ")[0])})</button>`:`<a class="btn btn-sm btn-light" href="login.html">Login / Register</a>`}</li>
  </ul></div></div></nav>`;
}
function logout(){localStorage.removeItem("fitlifeCurrentUser");location.href="index.html"}
function requireUser(box,content){
  if(!current()){document.getElementById(box)?.classList.remove("d-none");document.getElementById(content)?.classList.add("d-none");return false}
  return true;
}
function initVisit(){
  let x=db();
  if(!sessionStorage.getItem("fitlifeVisited")){x.visits++;save(x);sessionStorage.setItem("fitlifeVisited","1")}
}
function authTabFromUrl(){
  let q=new URLSearchParams(location.search);
  if(q.get("register")==="1"){let b=document.querySelector('[data-bs-target="#registerPane"]');if(b&&window.bootstrap)new bootstrap.Tab(b).show()}
}
function register(){
  const f=document.getElementById("registerForm");if(!f)return;
  f.addEventListener("submit",e=>{
    e.preventDefault();
    let name=document.getElementById("regName").value.trim(),email=document.getElementById("regEmail").value.trim().toLowerCase();
    let pass=document.getElementById("regPassword").value,confirm=document.getElementById("regConfirm").value,x=db();
    if(name.length<2)return toast("Please enter your full name");
    if(pass.length<6)return toast("Password must contain at least 6 characters");
    if(pass!==confirm)return toast("Passwords do not match");
    if(email===ADMIN_EMAIL)return toast("Please use another email");
    if(x.users.some(u=>u.email===email))return toast("Account already exists. Please login.");
    let u={id:Date.now(),name,email,password:pass,plan:null,progress:[],workouts:[]};
    x.users.push(u);save(x);setCurrent(u);toast("Registration successful");
    setTimeout(()=>location.href="dashboard.html",500);
  });
}
function login(){
  const f=document.getElementById("loginForm");if(!f)return;
  f.addEventListener("submit",e=>{
    e.preventDefault();
    let email=document.getElementById("loginEmail").value.trim().toLowerCase(),pass=document.getElementById("loginPassword").value;
    if(email===ADMIN_EMAIL&&pass===ADMIN_PASS){localStorage.setItem("fitlifeAdmin","1");location.href="admin.html";return}
    let x=db(),u=x.users.find(a=>a.email===email&&a.password===pass);
    if(!u)return toast("Invalid email or password");
    setCurrent(u);toast("Login successful");setTimeout(()=>location.href="dashboard.html",400);
  });
}

function planner(){
  const f=document.getElementById("plannerForm");if(!f)return;
  if(!requireUser("plannerLock","plannerContent"))return;
  let u=current(),p=u.plan||{};
  ["name","age","gender","height","weight","goal","activity","food","dietStyle","meals","experience","training","sleep","medical","injury","preferences"].forEach(id=>{
    let el=document.getElementById(id);if(el&&p[id]!=null)el.value=p[id];
  });
  if(p.name)document.getElementById("name").value=p.name;
  if(p.meals==null)document.getElementById("meals").value="5";

  f.addEventListener("submit",e=>{
    e.preventDefault();
    let age=+document.getElementById("age").value,height=+document.getElementById("height").value,weight=+document.getElementById("weight").value;
    let gender=document.getElementById("gender").value,goal=document.getElementById("goal").value,activity=document.getElementById("activity").value;
    let food=document.getElementById("food").value,experience=document.getElementById("experience").value,medical=document.getElementById("medical").value;
    let injury=document.getElementById("injury").value.trim(),dietStyle=document.getElementById("dietStyle").value,meals=Number(document.getElementById("meals").value);
    let training=document.getElementById("training").value,sleep=document.getElementById("sleep").value,preferences=document.getElementById("preferences").value.trim();
    let bmi=weight/((height/100)**2),mult={low:1.2,medium:1.55,high:1.725}[activity]||1.2;
    let bmr=gender==="male"?(10*weight+6.25*height-5*age+5):(10*weight+6.25*height-5*age-161);
    let adjustment=goal==="lose"?-300:goal==="gain"?300:goal==="strength"?150:0;
    let cal=Math.round(Math.max(1200,bmr*mult+adjustment));
    let protein=Math.round(weight*(dietStyle==="highProtein"?1.6:(goal==="gain"||goal==="strength"?1.4:1.2)));
    let water=Math.max(2,Math.round(weight*.035*10)/10);

    if(medical!=="none"||injury)toast("Health safeguard active: recommendations are general and conservative. Please consult a professional.");
    let plan={name:document.getElementById("name").value.trim(),age,height,weight,gender,goal,activity,food,dietStyle,meals,experience,training,sleep,medical,injury,preferences,bmi:+bmi.toFixed(1),calories:cal,protein,water:water+" L",created:new Date().toISOString()};
    u.plan=plan;u.progress=u.progress||[];
    if(!u.progress.length)u.progress.push({date:new Date().toLocaleDateString("en-IN"),weight,waist:"-",bodyFat:"-"});
    updateUser(u);renderPlan(plan);toast("Your new personalized plan has been saved");
  });
  if(p.created)renderPlan(p);
}
function updateUser(u){let x=db(),i=x.users.findIndex(a=>a.id===u.id);if(i>=0)x.users[i]=u;save(x);setCurrent(u)}

function hashText(s){return [...String(s||"")].reduce((n,c)=>(n*31+c.charCodeAt(0))%100000,7)}
function choose(arr,seed){return arr[Math.abs(seed)%arr.length]}
function foodSets(food){
  const common={
    breakfast:["oats with milk/curd + banana + nuts","vegetable poha + curd + seasonal fruit","upma with vegetables + curd + fruit"],
    snack:["fruit + a small handful of nuts","roasted chana + fruit","curd/yogurt + fruit"],
    lunch:["2 chapati + dal + mixed vegetables + curd","rice + dal + vegetables + salad","chapati + rajma/chole + vegetables + salad"],
    evening:["roasted chana + lemon water","peanut/seed snack + fruit","sprouts chaat + fruit"],
    dinner:["chapati + mixed vegetables + protein-rich side + salad","vegetable khichdi + curd/suitable protein side","dal + chapati + vegetables + salad"]
  };
  if(food==="vegan")return {
    breakfast:["oats with soy milk + banana + seeds","vegetable poha + sprouts + fruit","upma + sprouts + fruit"],
    snack:["fruit + peanuts","roasted chana + fruit","soy yogurt + fruit"],
    lunch:["chapati + dal + vegetables + salad","rice + rajma + vegetables + salad","chapati + chole + vegetables + salad"],
    evening:["roasted chana + lemon water","peanut/seed snack + fruit","sprouts chaat + fruit"],
    dinner:["chapati + tofu/soy protein + vegetables","dal + rice + vegetables + salad","vegetable khichdi + tofu/soy protein side"]
  };
  if(food==="nonveg")return {
    breakfast:["oats + milk + banana + eggs","vegetable poha + eggs + fruit","upma + curd + eggs + fruit"],
    snack:["fruit + nuts","curd/yogurt + fruit","boiled eggs + fruit"],
    lunch:["chapati + dal + vegetables + chicken/fish + salad","rice + dal + chicken/fish + vegetables","chapati + rajma + chicken/egg side + salad"],
    evening:["roasted chana + fruit","curd/yogurt + nuts","boiled eggs + fruit"],
    dinner:["chapati + vegetables + chicken/fish + salad","rice + dal + egg/chicken side + vegetables","khichdi + curd + egg/chicken side"]
  };
  return common;
}
function renderPlan(p){
  let sets=foodSets(p.food),seed=hashText(`${p.name}|${p.goal}|${p.food}|${p.dietStyle}|${p.activity}|${p.training}|${p.preferences}`);
  let labels=[["Breakfast","breakfast"],["Mid-morning","snack"],["Lunch","lunch"],["Evening","evening"],["Dinner","dinner"]];
  let selected=labels.slice(0,Math.max(3,Math.min(5,p.meals||5))).map((a,i)=>({label:a[0],text:choose(sets[a[1]],seed+i*17)}));
  let avoid=(p.preferences||"").toLowerCase();
  selected=selected.map((m,i)=>{
    let text=m.text;
    if(avoid && text.toLowerCase().split(/\W+/).some(w=>w.length>2&&avoid.includes(w))) text=choose(sets[labels[i][1]],seed+i*17+1);
    return {...m,text};
  });
  let workoutBase=p.training==="Home"
    ?["Walk + mobility","Bodyweight squats + incline push-ups + glute bridges","Light cardio + mobility","Lunges + rows/band pulls + plank","Full-body home circuit","Cardio + stretching","Rest / recovery"]
    :p.training==="Gym"
    ?["Upper body + light cardio","Lower body + core","Recovery walk + mobility","Push + core","Pull + cardio","Legs + mobility","Rest / recovery"]
    :["Full-body strength + walk","Lower body + core","Walk + mobility","Upper body + core","Full-body strength","Cardio + stretching","Rest / recovery"];
  if(p.experience==="advanced")workoutBase=workoutBase.map((x,i)=>i===6?"Rest / recovery":x+" • progressive overload");
  if(p.experience==="beginner")workoutBase=workoutBase.map((x,i)=>i===6?x:x+" • easy/moderate pace");
  let goalText={lose:"fat-loss focused",gain:"healthy weight-gain focused",maintain:"maintenance focused",strength:"strength focused"}[p.goal]||"goal focused";
  document.getElementById("planOutput").innerHTML=`
  <div class="col-12"><div class="alert alert-success"><b>Your plan is ${esc(goalText)}.</b> It uses your ${esc(p.food)} food preference, ${esc(p.activity)} activity level, ${esc(p.training)} training choice, ${esc(p.dietStyle)} diet style and ${esc(p.meals)} meals/day.</div></div>
  <div class="col-lg-4"><div class="plan-box"><h5><i class="bi bi-speedometer2 brand-green"></i> Your Numbers</h5>
  <div class="plan-item">BMI <b>${p.bmi}</b></div><div class="plan-item">Estimated energy <b>${p.calories} kcal/day</b></div>
  <div class="plan-item">Protein target <b>${p.protein} g/day</b></div><div class="plan-item">Water target <b>${esc(p.water)}/day</b></div>
  <div class="plan-item">Sleep <b>${esc(p.sleep)}</b></div></div></div>
  <div class="col-lg-4"><div class="plan-box"><h5><i class="bi bi-egg-fried brand-green"></i> Your Daily Diet</h5>
  ${selected.map(x=>`<div class="plan-item"><b>${esc(x.label)}</b><br>${esc(x.text)}</div>`).join("")}
  <div class="small text-secondary mt-2">Adjust portions to appetite and professional advice. Avoid any ingredient you listed in preferences.</div></div></div>
  <div class="col-lg-4"><div class="plan-box"><h5><i class="bi bi-activity brand-green"></i> Your Weekly Workout</h5>
  ${workoutBase.map((x,i)=>`<div class="plan-item"><b>${["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i]}</b> — ${esc(x)}</div>`).join("")}
  <div class="small text-secondary mt-2">Stop if you have pain, dizziness or unusual symptoms.</div></div></div>`;
}

function dashboard(){
  if(!document.getElementById("dashboardContent"))return;
  if(!requireUser("dashboardLock","dashboardContent"))return;
  let u=current(),p=u.plan||{};
  dashName.textContent=u.name;dashBMI.textContent=p.bmi||"--";dashWeight.textContent=p.weight?`${p.weight} kg`:"--";
  dashCalories.textContent=p.calories?`${p.calories}`:"--";dashWater.textContent=p.water||"--";
  progressTable.innerHTML=(u.progress||[]).slice().reverse().map(a=>`<tr><td>${esc(a.date)}</td><td>${esc(a.weight)} kg</td><td>${esc(a.waist)} cm</td><td>${esc(a.bodyFat)}%</td></tr>`).join("")||`<tr><td colspan="4" class="text-secondary">No progress entries yet.</td></tr>`;
  workoutList.innerHTML=(u.workouts||[]).slice().reverse().map(a=>`<div class="reminder-item"><div><b>${esc(a.exercise)}</b><br><small>${esc(a.date)} • ${esc(a.duration)} min • ${esc(a.intensity)}</small></div></div>`).join("")||`<p class="text-secondary">No workouts logged yet.</p>`;
  let f=document.getElementById("progressForm");
  f?.addEventListener("submit",e=>{e.preventDefault();u.progress=u.progress||[];u.progress.push({date:new Date().toLocaleDateString("en-IN"),weight:pWeight.value,waist:pWaist.value||"-",bodyFat:pBodyFat.value||"-"});u.plan={...u.plan,weight:Number(pWeight.value)};updateUser(u);toast("Progress saved");location.reload()});
  let wf=document.getElementById("workoutForm");
  if(wf)wf.addEventListener("submit",e=>{e.preventDefault();u.workouts=u.workouts||[];u.workouts.push({date:wDate.value,exercise:wExercise.value,duration:wDuration.value,intensity:wIntensity.value});updateUser(u);toast("Workout saved");location.reload()});
  let rs=db().reminders.filter(r=>r.userId===u.id);
  dashboardReminders.innerHTML=rs.length?rs.map(r=>`<div class="reminder-item"><div><b>${esc(r.type)}</b> • ${esc(r.time)}</div><span>${esc(r.message)}</span></div>`).join(""):`<p class="text-secondary">No reminders yet.</p>`;
}

function reminders(){
  let f=document.getElementById("reminderForm");if(!f)return;
  let u=current();if(!u){toast("Login required");setTimeout(()=>location.href="login.html",600);return}
  renderReminders();
  f.addEventListener("submit",e=>{e.preventDefault();let x=db();x.reminders.push({id:Date.now(),userId:u.id,type:rType.value,time:rTime.value,message:rMessage.value||`Time for your ${rType.value.toLowerCase()} reminder`});save(x);renderReminders();toast("Reminder added")});
  notificationBtn?.addEventListener("click",async()=>{if(!("Notification"in window))return toast("This browser does not support notifications");let p=await Notification.requestPermission();toast(p==="granted"?"Notifications enabled":"Notification permission not granted")});
  testNotification?.addEventListener("click",()=>{if("Notification"in window&&Notification.permission==="granted")new Notification("FitLife Reminder",{body:"Stay consistent with your fitness goal 💪"});else toast("Enable notifications first")});
}
function renderReminders(){let u=current(),x=db(),rs=x.reminders.filter(r=>r.userId===u.id);reminderList.innerHTML=rs.length?rs.map(r=>`<div class="reminder-item"><div><b>${esc(r.type)}</b> • ${esc(r.time)}</div><div>${esc(r.message)} <button class="btn btn-sm btn-outline-danger ms-2" onclick="deleteReminder(${r.id})">Delete</button></div></div>`).join(""):`<p class="text-secondary">No reminders added.</p>`}
function deleteReminder(id){let x=db();x.reminders=x.reminders.filter(r=>r.id!==id);save(x);renderReminders()}

function shop(){
  let g=document.getElementById("productGrid");if(!g)return;let x=db();
  g.innerHTML=x.products.map(p=>`<div class="col-md-6 col-lg-4"><div class="product-card"><div class="product-img">${p.img?.startsWith("http")?`<img src="${esc(p.img)}" style="max-width:100%;max-height:180px" alt="">`:esc(p.img||"💪")}</div><div class="product-body"><span class="eyebrow">${esc(p.category)}</span><h4 class="mt-2">${esc(p.name)}</h4><p class="text-secondary small">${esc(p.desc)}</p><div class="d-flex justify-content-between align-items-center"><span class="price">₹${Number(p.price).toLocaleString("en-IN")}</span><button class="btn btn-brand" onclick="addCart(${p.id})"><i class="bi bi-cart-plus"></i> Add</button></div></div></div></div>`).join("");
  updateCartCount();
}
function cart(){
  if(!document.getElementById("cartContent"))return;
  let c=JSON.parse(localStorage.getItem("fitlifeCart")||"[]"),x=db(),items=c.map(i=>({...i,product:x.products.find(p=>p.id===i.id)})).filter(i=>i.product);
  if(!items.length){cartContent.innerHTML=`<div class="empty-card"><i class="bi bi-cart-x"></i><h3>Your cart is empty</h3><a href="shop.html" class="btn btn-brand">Shop Products</a></div>`;return}
  let total=items.reduce((s,i)=>s+i.product.price*i.qty,0);
  cartContent.innerHTML=`<div class="panel-card">${items.map(i=>`<div class="cart-row"><div class="d-flex gap-3 align-items-center"><div class="cart-thumb">${esc(i.product.img)}</div><div><b>${esc(i.product.name)}</b><div class="text-secondary small">₹${i.product.price.toLocaleString("en-IN")} × ${i.qty}</div></div></div><div><button class="btn btn-sm btn-outline-secondary" onclick="changeQty(${i.id},-1)">−</button> <b class="mx-2">${i.qty}</b><button class="btn btn-sm btn-outline-secondary" onclick="changeQty(${i.id},1)">+</button> <button class="btn btn-sm btn-outline-danger ms-2" onclick="removeCart(${i.id})">Remove</button></div></div>`).join("")}<div class="text-end mt-4"><h3>Total: ₹${total.toLocaleString("en-IN")}</h3><a href="checkout.html" class="btn btn-brand btn-lg">Proceed to Checkout</a></div></div>`;
}
function addCart(id){let c=JSON.parse(localStorage.getItem("fitlifeCart")||"[]"),i=c.find(a=>a.id===id);i?i.qty++:c.push({id,qty:1});localStorage.setItem("fitlifeCart",JSON.stringify(c));updateCartCount();toast("Product added to cart")}
function changeQty(id,n){let c=JSON.parse(localStorage.getItem("fitlifeCart")||"[]"),i=c.find(a=>a.id===id);if(i)i.qty+=n;c=c.filter(a=>a.qty>0);localStorage.setItem("fitlifeCart",JSON.stringify(c));cart();updateCartCount()}
function removeCart(id){let c=JSON.parse(localStorage.getItem("fitlifeCart")||"[]").filter(a=>a.id!==id);localStorage.setItem("fitlifeCart",JSON.stringify(c));cart();updateCartCount()}
function updateCartCount(){let c=JSON.parse(localStorage.getItem("fitlifeCart")||"[]");let n=c.reduce((s,a)=>s+a.qty,0);document.querySelectorAll("#cartCount").forEach(e=>e.textContent=n)}

function getCartItems(){
  let c=JSON.parse(localStorage.getItem("fitlifeCart")||"[]"),x=db();
  return c.map(i=>({...i,product:x.products.find(p=>p.id===i.id)})).filter(i=>i.product);
}
function cartTotal(){return getCartItems().reduce((s,i)=>s+i.product.price*i.qty,0)}
function luhnValid(number){
  let n=String(number).replace(/\D/g,"");if(n.length<13||n.length>19)return false;
  let sum=0,dbl=false;for(let i=n.length-1;i>=0;i--){let d=+n[i];if(dbl){d*=2;if(d>9)d-=9}sum+=d;dbl=!dbl}return sum%10===0;
}
function validExpiry(v){
  let m=String(v).match(/^(0[1-9]|1[0-2])\/(\d{2})$/);if(!m)return false;
  let month=+m[1],year=2000+(+m[2]),now=new Date(),curY=now.getFullYear(),curM=now.getMonth()+1;
  return year>curY||(year===curY&&month>=curM);
}
function checkout(){
  let f=document.getElementById("checkoutForm");if(!f)return;
  let u=current();if(!u){document.getElementById("checkoutLock").innerHTML=`<div class="alert alert-warning">Please <a href="login.html">login or register</a> before checkout.</div>`;f.classList.add("d-none");return}
  let items=getCartItems(),total=cartTotal();
  if(!items.length){document.getElementById("checkoutLock").innerHTML=`<div class="empty-card"><h3>Your cart is empty</h3><a href="shop.html" class="btn btn-brand">Visit Store</a></div>`;f.classList.add("d-none");return}
  document.getElementById("checkoutTotal").innerHTML=`<div class="d-flex justify-content-between"><span>Items</span><b>${items.reduce((s,i)=>s+i.qty,0)}</b></div><div class="d-flex justify-content-between mt-2"><span>Total</span><b class="price">₹${total.toLocaleString("en-IN")}</b></div>`;
  let radios=[...document.querySelectorAll('input[name="payment"]')];
  const toggle=()=>{let m=document.querySelector('input[name="payment"]:checked')?.value;upiBox.classList.toggle("d-none",m!=="UPI");cardBox.classList.toggle("d-none",m!=="Card");placeOrderBtn.innerHTML=m==="Cash on Delivery"?`<i class="bi bi-bag-check"></i> Place COD Order`:`<i class="bi bi-lock"></i> Pay & Place Order`};
  radios.forEach(r=>r.addEventListener("change",toggle));toggle();
  cardNumber.addEventListener("input",()=>{let n=cardNumber.value.replace(/\D/g,"").slice(0,16);cardNumber.value=n.replace(/(.{4})/g,"$1 ").trim()});
  cardExpiry.addEventListener("input",()=>{let n=cardExpiry.value.replace(/\D/g,"").slice(0,4);cardExpiry.value=n.length>2?n.slice(0,2)+"/"+n.slice(2):n});
  f.addEventListener("submit",e=>{
    e.preventDefault();
    let method=document.querySelector('input[name="payment"]:checked')?.value||"Cash on Delivery";
    if(!/^\d{10}$/.test(cMobile.value))return toast("Enter a valid 10-digit mobile number");
    if(!/^\d{6}$/.test(cPin.value))return toast("Enter a valid 6-digit pincode");
    let paymentStatus="Pay on Delivery",paymentRef="";
    if(method==="UPI"){
      if(!/^[\w.\-]{2,}@[A-Za-z]{2,}$/.test(upiId.value.trim()))return toast("Enter a valid demo UPI ID, e.g. name@upi");
      paymentStatus="Paid (Demo UPI)";paymentRef="UPI-"+Date.now().toString().slice(-8);
    }
    if(method==="Card"){
      let raw=cardNumber.value.replace(/\s/g,"");
      if(!luhnValid(raw))return toast("Enter a valid demo card number");
      if(!validExpiry(cardExpiry.value))return toast("Enter a valid future expiry date");
      if(!/^\d{3,4}$/.test(cardCvv.value))return toast("Enter a valid CVV");
      paymentStatus="Paid (Demo Card)";paymentRef="CARD-"+raw.slice(-4);
    }
    let x=db(),o={id:"FL"+Date.now().toString().slice(-8),userId:u.id,userName:u.name,email:u.email,items,total,
      address:{name:cName.value.trim(),mobile:cMobile.value,address:cAddress.value.trim(),city:cCity.value.trim(),state:cState.value.trim(),pin:cPin.value},
      payment:{method,status:paymentStatus,reference:paymentRef},status:"Order Placed",created:new Date().toISOString()};
    x.orders.push(o);save(x);localStorage.removeItem("fitlifeCart");showOrderSuccess(o);
  });
}
function showOrderSuccess(o){
  let lines=o.items.map(i=>`<div class="d-flex justify-content-between"><span>${esc(i.product.name)} × ${i.qty}</span><b>₹${(i.product.price*i.qty).toLocaleString("en-IN")}</b></div>`).join("");
  document.body.innerHTML=`<div class="container py-5"><div class="empty-card mx-auto" style="max-width:760px;text-align:left">
    <div class="text-center"><i class="bi bi-check-circle-fill text-success" style="font-size:70px"></i><h1 class="mt-3">Order placed successfully!</h1><p>Your order <b>${esc(o.id)}</b> is now saved to your account.</p></div>
    <hr><h5>Payment receipt</h5><div class="receipt-box">${lines}<hr><div class="d-flex justify-content-between"><b>Total</b><b>₹${o.total.toLocaleString("en-IN")}</b></div><div class="mt-2"><b>Method:</b> ${esc(o.payment.method)}<br><b>Status:</b> ${esc(o.payment.status)}${o.payment.reference?`<br><b>Reference:</b> ${esc(o.payment.reference)}`:""}</div></div>
    <div class="text-center mt-4"><a href="orders.html" class="btn btn-brand">Track Order</a> <a href="index.html" class="btn btn-outline-brand">Back Home</a></div>
  </div></div>`;
}

function orders(){
  let el=document.getElementById("ordersList");if(!el)return;let u=current();
  if(!u){el.innerHTML=`<div class="empty-card"><h3>Login to see your orders</h3><a href="login.html" class="btn btn-brand">Login</a></div>`;return}
  let x=db(),os=x.orders.filter(o=>o.userId===u.id).reverse();
  el.innerHTML=os.length?os.map(o=>{let states=["Order Placed","Packed","Shipped","Out for Delivery","Delivered"],idx=states.indexOf(o.status);
    return `<div class="panel-card mb-3"><div class="d-flex justify-content-between flex-wrap"><div><b>${o.id}</b><div class="text-secondary small">${new Date(o.created).toLocaleString("en-IN")}</div></div><div class="text-end"><b>₹${o.total.toLocaleString("en-IN")}</b><br><small>${esc(o.payment?.method||"")}</small></div></div>
    <div class="small text-secondary mt-2">${o.items.map(i=>esc(i.product.name)+" × "+i.qty).join(" • ")}</div>
    <div class="row g-2 mt-4">${states.map((s,i)=>`<div class="col"><div class="order-step ${i<=idx?"active":""}"><span>${i+1}</span><small>${s}</small></div></div>`).join("")}</div></div>`}).join("")
    :`<div class="empty-card"><i class="bi bi-box-seam"></i><h3>No orders yet</h3><a href="shop.html" class="btn btn-brand">Visit Store</a></div>`;
}

function admin(){
  let login=document.getElementById("adminLoginForm");if(!login)return;
  if(localStorage.getItem("fitlifeAdmin")==="1")showAdmin();
  login.addEventListener("submit",e=>{e.preventDefault();if(adminEmail.value===ADMIN_EMAIL&&adminPass.value===ADMIN_PASS){localStorage.setItem("fitlifeAdmin","1");showAdmin()}else toast("Wrong admin credentials")});
  adminLogout?.addEventListener("click",()=>{localStorage.removeItem("fitlifeAdmin");location.reload()});
  productForm?.addEventListener("submit",e=>{e.preventDefault();let x=db();x.products.push({id:Date.now(),name:prName.value,category:prCategory.value,price:Number(prPrice.value),img:prImage.value||"💪",desc:prDesc.value});save(x);productForm.reset();prImage.value="💪";showAdmin();toast("Product added")});
}
function showAdmin(){
  adminLogin.classList.add("d-none");adminContent.classList.remove("d-none");let x=db();
  aUsers.textContent=x.users.length;aVisitors.textContent=x.visits;aOrders.textContent=x.orders.length;aSales.textContent="₹"+x.orders.reduce((s,o)=>s+o.total,0).toLocaleString("en-IN");
  adminProducts.innerHTML=x.products.map(p=>`<div class="admin-product"><span>${esc(p.img)} <b>${esc(p.name)}</b><small class="text-secondary"> • ₹${p.price}</small></span><button class="btn btn-sm btn-outline-danger" onclick="adminDeleteProduct(${p.id})">Delete</button></div>`).join("");
  adminOrders.innerHTML=x.orders.slice().reverse().map(o=>`<tr><td><b>${o.id}</b></td><td>${esc(o.userName)}<br><small>${esc(o.email)}</small></td><td>₹${o.total}</td><td><span class="status-badge">${esc(o.status)}</span></td><td><select class="form-select form-select-sm" onchange="adminStatus('${o.id}',this.value)">${["Order Placed","Packed","Shipped","Out for Delivery","Delivered","Cancelled"].map(s=>`<option ${s===o.status?"selected":""}>${s}</option>`).join("")}</select></td></tr>`).join("")||`<tr><td colspan="5" class="text-secondary">No orders yet.</td></tr>`;
}
function adminDeleteProduct(id){let x=db();x.products=x.products.filter(p=>p.id!==id);save(x);showAdmin()}
function adminStatus(id,status){let x=db(),o=x.orders.find(a=>a.id===id);if(o)o.status=status;save(x);showAdmin();toast("Order status updated")}

function updateReminderNotifications(){
  if(!("Notification"in window)||Notification.permission!=="granted")return;let u=current();if(!u)return;
  let now=new Date(),hm=now.toTimeString().slice(0,5),key="fitlifeReminder_"+now.toISOString().slice(0,10)+"_"+hm,x=db();
  x.reminders.filter(r=>r.userId===u.id&&r.time===hm).forEach(r=>{if(!sessionStorage.getItem(key+r.id)){new Notification("FitLife • "+r.type,{body:r.message});sessionStorage.setItem(key+r.id,"1")}});
}
document.addEventListener("DOMContentLoaded",()=>{
  nav();initVisit();authTabFromUrl();register();login();planner();dashboard();reminders();shop();cart();checkout();orders();admin();
  updateReminderNotifications();setInterval(updateReminderNotifications,30000);updateCartCount();
});
