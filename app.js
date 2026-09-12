const $  = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

let currentLesson = parseInt(localStorage.getItem("lastLesson") || "1", 10);
let theme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-theme", theme);

function toFa(n) {
  return String(n).replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[d]);
}

const sidebar  = $("#sidebar");
const overlay  = $("#overlay");
const lessonList = $("#lessonList");

LESSONS.forEach(l => {
  const li = document.createElement("li");
  li.innerHTML = `<a href="#" data-lesson="${l.id}">جلسه ${toFa(l.id)}: ${l.title}</a>`;
  lessonList.appendChild(li);
});

function openSidebar()  { sidebar.classList.add("open");  overlay.classList.add("show"); }
function closeSidebar() { sidebar.classList.remove("open"); overlay.classList.remove("show"); }

$("#menuBtn").onclick       = openSidebar;
$("#closeSidebar").onclick  = closeSidebar;
overlay.onclick             = closeSidebar;

function applyTheme() {
  document.documentElement.setAttribute("data-theme", theme);
  $("#themeBtn").textContent = theme === "dark" ? "☀️" : "🌙";
}
$("#themeBtn").onclick = () => {
  theme = theme === "light" ? "dark" : "light";
  localStorage.setItem("theme", theme);
  applyTheme();
};
applyTheme();

function renderLesson(id) {
  currentLesson = id;
  localStorage.setItem("lastLesson", id);

  const lesson = LESSONS.find(l => l.id === id);
  if (!lesson) return;

  $("#pageTitle").textContent = `جلسه ${toFa(id)}: ${lesson.title}`;
  $("#lessonCounter").textContent = `${toFa(id)} از ${toFa(LESSONS.length)}`;

  let html = `<h2>${lesson.title}</h2>`;

  if (lesson.goals && lesson.goals.length) {
    html += `<div class="card goals"><strong>🎯 اهداف جلسه:</strong><ul>`;
    lesson.goals.forEach(g => html += `<li>${g}</li>`);
    html += `</ul></div>`;
  }

  lesson.sections.forEach(s => {
    switch (s.type) {
      case "h3":
        html += `<h3>${s.text}</h3>`; break;
      case "p":
        html += `<p>${s.text}</p>`; break;
      case "formula":
        html += `<div class="formula">${s.text}</div>`; break;
      case "note":
        html += `<div class="note">💡 ${s.text}</div>`; break;
      case "warn":
        html += `<div class="warn">⚠️ ${s.text}</div>`; break;
      case "example":
        html += `<div class="example">📘 ${s.text}</div>`; break;
      case "list":
        html += `<ul>`;
        s.items.forEach(i => html += `<li>${i}</li>`);
        html += `</ul>`;
        break;
      case "table":
        html += `<table><thead><tr>`;
        s.headers.forEach(h => html += `<th>${h}</th>`);
        html += `</tr></thead><tbody>`;
        s.rows.forEach(r => {
          html += `<tr>`;
          r.forEach(c => html += `<td>${c}</td>`);
          html += `</tr>`;
        });
        html += `</tbody></table>`;
        break;
    }
  });

  $("#content").innerHTML = html;
  closeSidebar();
  window.scrollTo({ top: 0, behavior: "smooth" });
  updateProgress();
  highlightActive();
  refreshNavButtons();
}

function updateProgress() {
  const pct = (currentLesson / LESSONS.length) * 100;
  $("#progressBar").style.width = pct + "%";
}
function highlightActive() {
  $$("#lessonList a").forEach(a => {
    a.classList.toggle("active", parseInt(a.dataset.lesson) === currentLesson);
  });
}
function refreshNavButtons() {
  $("#prevBtn").disabled = currentLesson <= 1;
  $("#nextBtn").disabled = currentLesson >= LESSONS.length;
}

$("#prevBtn").onclick = () => { if (currentLesson > 1) renderLesson(currentLesson - 1); };
$("#nextBtn").onclick = () => { if (currentLesson < LESSONS.length) renderLesson(currentLesson + 1); };

document.addEventListener("click", e => {
  const lessonLink = e.target.closest("a[data-lesson]");
  if (lessonLink) {
    e.preventDefault();
    renderLesson(parseInt(lessonLink.dataset.lesson));
    return;
  }
  const pageLink = e.target.closest("a[data-page]");
  if (pageLink) {
    e.preventDefault();
    const page = pageLink.dataset.page;
    if (page === "tools") renderTools();
    else if (page === "flash") renderFlashcards();
    else if (page === "quiz") renderQuiz();
    else if (page === "about") renderAbout();
  }
});

function renderTools() {
  $("#pageTitle").textContent = "🧮 ابزارها";
  $("#content").innerHTML = `
    <h2>🧮 ماشین‌حساب قانون اهم</h2>
    <p>دو مقدار را وارد کن، سومین محاسبه می‌شود.</p>
    <div class="calculator card">
      <label>ولتاژ (V)</label>
      <input id="v" type="number" inputmode="decimal" placeholder="مثلاً 12" />
      <label>جریان (A)</label>
      <input id="i" type="number" inputmode="decimal" placeholder="مثلاً 2" />
      <label>مقاومت (Ω)</label>
      <input id="r" type="number" inputmode="decimal" placeholder="مثلاً 6" />
      <button onclick="calcOhm()">محاسبه</button>
      <div class="result" id="ohmResult">—</div>
    </div>

    <h2>🧮 مقاومت معادل</h2>
    <div class="calculator card">
      <label>نوع اتصال</label>
      <select id="mode">
        <option value="series">سری</option>
        <option value="parallel">موازی</option>
      </select>
      <label>مقادیر (با کاما جدا کن)</label>
      <input id="resistors" placeholder="مثلاً: 2,4,6" inputmode="decimal" />
      <button onclick="calcResistance()">محاسبه</button>
      <div class="result" id="resResult">—</div>
    </div>

    <h2>🧮 توان و انرژی</h2>
    <div class="calculator card">
      <label>ولتاژ (V)</label>
      <input id="pv" type="number" inputmode="decimal" />
      <label>جریان (A)</label>
      <input id="pi" type="number" inputmode="decimal" />
      <label>زمان کار (ساعت) — اختیاری</label>
      <input id="pt" type="number" inputmode="decimal" />
      <button onclick="calcPower()">محاسبه</button>
      <div class="result" id="powerResult">—</div>
    </div>
  `;
}

function calcOhm() {
  const v = parseFloat($("#v").value);
  const i = parseFloat($("#i").value);
  const r = parseFloat($("#r").value);
  let out = "❗ دو مقدار را وارد کن.";
  if (!isNaN(v) && !isNaN(i))      out = `R = ${v} ÷ ${i} = ${(v/i).toFixed(3)} Ω`;
  else if (!isNaN(v) && !isNaN(r)) out = `I = ${v} ÷ ${r} = ${(v/r).toFixed(3)} A`;
  else if (!isNaN(i) && !isNaN(r)) out = `V = ${i} × ${r} = ${(i*r).toFixed(3)} V`;
  $("#ohmResult").textContent = out;
}

function calcResistance() {
  const mode = $("#mode").value;
  const arr = $("#resistors").value.split(/[,،\s]+/)
    .map(x => parseFloat(x)).filter(x => !isNaN(x) && x > 0);
  if (!arr.length) { $("#resResult").textContent = "❗ مقادیر را وارد کن."; return; }
  let r;
  if (mode === "series") {
    r = arr.reduce((a,b)=>a+b, 0);
  } else {
    const inv = arr.reduce((a,b)=>a + 1/b, 0);
    r = 1 / inv;
  }
  $("#resResult").textContent = `R = ${r.toFixed(3)} Ω`;
}

function calcPower() {
  const v = parseFloat($("#pv").value);
  const i = parseFloat($("#pi").value);
  const t = parseFloat($("#pt").value);
  if (isNaN(v) || isNaN(i)) {
    $("#powerResult").textContent = "❗ ولتاژ و جریان را وارد کن.";
    return;
  }
  const p = v * i;
  let out = `P = ${p.toFixed(2)} W`;
  if (!isNaN(t) && t > 0) {
    out += `  |  E = ${(p*t/1000).toFixed(3)} kWh`;
  }
  $("#powerResult").textContent = out;
}

let flashIndex = 0;

function renderFlashcards() {
  $("#pageTitle").textContent = "🧠 فلش‌کارت";
  drawFlash();
}

function drawFlash() {
  const c = FLASHCARDS[flashIndex];
  $("#content").innerHTML = `
    <h2>🧠 فلش‌کارت مرور سریع</h2>
    <p>روی کارت بزن تا جواب را ببینی.</p>
    <div class="flashcard" id="fc">
      <div class="flashcard-inner">
        <div class="flashcard-face">${c.q}</div>
        <div class="flashcard-face flashcard-back">${c.a}</div>
      </div>
    </div>
    <div class="flash-controls">
      <button onclick="prevFlash()">◀ قبلی</button>
      <span>${toFa(flashIndex+1)} از ${toFa(FLASHCARDS.length)}</span>
      <button onclick="nextFlash()">بعدی ▶</button>
    </div>
  `;
  $("#fc").onclick = () => $("#fc").classList.toggle("flipped");
}

function nextFlash() { flashIndex = (flashIndex + 1) % FLASHCARDS.length; drawFlash(); }
function prevFlash() { flashIndex = (flashIndex - 1 + FLASHCARDS.length) % FLASHCARDS.length; drawFlash(); }

function renderQuiz() {
  $("#pageTitle").textContent = "📝 آزمون پایانی";
  let html = `<h2>📝 آزمون پایانی پودمان ۱</h2>
              <p>${toFa(QUIZ.length)} سؤال — گزینه درست را انتخاب کن.</p>`;

  QUIZ.forEach((q, i) => {
    html += `<div class="quiz-q card" id="q${i}">
      <p><strong>${toFa(i+1)}. ${q.q}</strong></p>`;
    q.options.forEach((o, j) => {
      html += `<label data-q="${i}" data-opt="${j}">
        <input type="radio" name="q${i}" value="${j}" /> ${o}
      </label>`;
    });
    html += `</div>`;
  });

  html += `<button class="submit-btn" onclick="submitQuiz()">ثبت پاسخ‌ها</button>`;
  html += `<div id="quizResult" class="result" style="font-size:1.15rem;"></div>`;
  $("#content").innerHTML = html;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function submitQuiz() {
  let correct = 0;
  QUIZ.forEach((q, i) => {
    const sel = document.querySelector(`input[name="q${i}"]:checked`);
    const labels = document.querySelectorAll(`#q${i} label`);
    labels.forEach(l => l.classList.remove("correct","wrong"));
    labels[q.answer].classList.add("correct");
    if (sel) {
      const v = parseInt(sel.value);
      if (v === q.answer) correct++;
      else labels[v].classList.add("wrong");
    }
  });
  const pct = Math.round((correct / QUIZ.length) * 100);
  let msg = `نمره: ${toFa(correct)} از ${toFa(QUIZ.length)} — ${toFa(pct)}٪`;
  if (pct >= 80) msg += " 🎉 عالی بود!";
  else if (pct >= 50) msg += " 👍 خوب بود، مرور کن.";
  else msg += " 📚 نیاز به مرور داری.";
  $("#quizResult").textContent = msg;
  $("#quizResult").scrollIntoView({ behavior: "smooth", block: "center" });
}

function renderAbout() {
  $("#pageTitle").textContent = "ℹ️ درباره";
  $("#content").innerHTML = `
    <h2>ℹ️ درباره این اپ</h2>
    <div class="card">
      <p><strong>دانش فنی پایه — پودمان ۱</strong></p>
      <p>مبانی برق و مدارهای الکتریکی در ۹ جلسه</p>
      <p>ساخته شده به صورت PWA با قابلیت نصب روی موبایل و کار آفلاین.</p>
    </div>
    <h3>امکانات</h3>
    <ul>
      <li>۹ جلسه کامل با اهداف و محتوا</li>
      <li>ابزارهای محاسباتی (اهم، سری/موازی، توان)</li>
      <li>فلش‌کارت مرور سریع</li>
      <li>آزمون پایانی با نمره‌دهی خودکار</li>
      <li>حالت شب و روز</li>
      <li>ذخیره آخرین جلسه</li>
      <li>کار آفلاین</li>
    </ul>
    <h3>نسخه</h3>
    <p>1.0.0</p>
  `;
}

renderLesson(currentLesson);
