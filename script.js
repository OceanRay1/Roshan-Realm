document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('theme-toggle');

  // Check saved theme or system setting
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (toggleBtn) toggleBtn.textContent = '☀️ Light Mode';
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const newTheme = isDark ? 'light' : 'dark';

      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      toggleBtn.textContent = isDark ? '🌙 Dark Mode' : '☀️ Light Mode';
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
    const items = document.querySelectorAll('.rotating-item');
    if (!items.length) return; // Prevents errors if the element isn't on the page

    let currentIndex = 0;

    setInterval(() => {
        items[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % items.length;
        items[currentIndex].classList.add('active');
    }, 3000); // Swaps every 3 seconds
});

async function loadGithubCalendar() {
  try {
    // Replace this URL with your deployed Vercel/Netlify function URL
    const response = await fetch('https://your-serverless-function.vercel.app/api/github');
    const data = await response.json();
    
    const container = document.querySelector('.calendar-wrapper-box');
    if (!container || !data.weeks) return;

    // Build grid structure dynamically
    container.innerHTML = '';
    data.weeks.forEach(week => {
      const col = document.createElement('div');
      col.className = 'calendar-column';
      
      week.contributionDays.forEach(day => {
        const square = document.createElement('div');
        square.className = 'calendar-day';
        square.style.backgroundColor = day.color;
        square.title = `${day.date}: ${day.contributionCount} contributions`;
        col.appendChild(square);
      });
      
      container.appendChild(col);
    });
  } catch (err) {
    console.error('Failed to load GitHub calendar:', err);
  }
}

document.addEventListener('DOMContentLoaded', loadGithubCalendar);

document.addEventListener("DOMContentLoaded", () => {
  // Render the calendar graph
  if (typeof GitHubCalendar === "function") {
    GitHubCalendar(".calendar", "OceanRay1", { responsive: true });
  }

  const countElement = document.getElementById("github-contributions-count");
  const username = "OceanRay1";

  // Fetch your actual public GitHub profile page HTML via CORS proxy
  fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(`https://github.com/users/${username}/contributions`)}`)
    .then((response) => {
      if (response.ok) return response.json();
      throw new Error("Network response was not ok.");
    })
    .then((data) => {
      // Parse the raw HTML returned from GitHub
      const parser = new DOMParser();
      const doc = parser.parseFromString(data.contents, "text/html");

      // Target the exact heading GitHub uses for the contribution count
      const heading = doc.querySelector("h2.f4") || doc.querySelector(".js-year-contributions");

      if (heading) {
        // Extract only the numbers (e.g., "542 contributions in the last year" -> "542")
        const rawText = heading.textContent.trim();
        const numberMatch = rawText.match(/([\d,]+)/);

        if (numberMatch && countElement) {
          countElement.innerText = `${numberMatch[1]} Commits`;
        }
      }
    })
    .catch((err) => {
      console.error("Error fetching GitHub profile count:", err);
    });
});