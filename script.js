document.addEventListener("DOMContentLoaded", () => {
  const gameListEl = document.getElementById("game-list");
  const gameFrame = document.getElementById("game-frame");
  const playerLabel = document.getElementById("player-label");
  const playerGameName = document.getElementById("player-game-name");
  const heroSection = document.getElementById("hero-section");

  const homeView = document.getElementById("home-view");
  const contactView = document.getElementById("contact-view");
  const navHome = document.getElementById("nav-home");
  const navContact = document.getElementById("nav-contact");

  const directoryToggle = document.getElementById("directory-toggle");
  const directoryChevron = document.getElementById("directory-chevron");

  const searchBtn = document.getElementById("search-btn");
  const searchInput = document.getElementById("search-input");

  const fullscreenBtn = document.getElementById("fullscreen-btn");
  const playerCard = document.getElementById("player-card");

  const sidebar = document.getElementById("sidebar");
  const sidebarBackdrop = document.getElementById("sidebar-backdrop");
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");

  let allGames = [];
  let featuredGame = null;

  function closeSidebar() {
    sidebar.classList.remove("open");
    sidebarBackdrop.classList.remove("open");
  }

  fetch("games.json")
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load games.json");
      return res.json();
    })
    .then((games) => {
      allGames = games;
      featuredGame = games.find((g) => g.featured) || games[0] || null;
      renderGameDirectory(allGames);
      loadGame(featuredGame, true);
    })
    .catch((err) => {
      console.error(err);
      renderGameDirectory([]);
      playerGameName.textContent = "ERROR LOADING GAMES.JSON";
    });

  function renderGameDirectory(games) {
    gameListEl.innerHTML = "";
    if (games.length === 0) {
      const emptyLi = document.createElement("li");
      emptyLi.textContent = "No games added";
      emptyLi.style.fontSize = "13px";
      emptyLi.style.opacity = "0.75";
      gameListEl.appendChild(emptyLi);
      return;
    }

    games.forEach((game) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.className = "game-item-btn";
      btn.textContent = game.title;
      btn.dataset.id = game.id;

      btn.addEventListener("click", () => {
        showHomeView(false);
        loadGame(game, false);
        setActiveGameButton(game.id);
        closeSidebar();
      });

      li.appendChild(btn);
      gameListEl.appendChild(li);
    });
  }

  function loadGame(game, isHomeFeatured) {
    if (!game) {
      gameFrame.removeAttribute("src");
      gameFrame.removeAttribute("srcdoc");
      playerGameName.textContent = "NO GAME SELECTED";
      return;
    }

    playerGameName.textContent = game.title.toUpperCase();

    if (game.script) {
      const baseHref = game.script.substring(0, game.script.lastIndexOf("/") + 1);
      gameFrame.removeAttribute("src");
      gameFrame.srcdoc =
        '<!DOCTYPE html><html><head><meta charset="UTF-8">' +
        '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">' +
        '<base href="' + baseHref + '">' +
        '<style>html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#000;}iframe,canvas{width:100%;height:100%;border:0;display:block;}</style>' +
        '</head><body><script src="' + game.script + '"><\/script></body></html>';
    } else if (game.url) {
      gameFrame.removeAttribute("srcdoc");
      gameFrame.src = game.url;
    }

    if (isHomeFeatured) {
      playerLabel.textContent = "QUICK GAME OF THE DAY 🎮";
      heroSection.classList.remove("hidden");
    } else {
      playerLabel.textContent = "NOW PLAYING 🎮";
      heroSection.classList.add("hidden");
    }
  }

  function setActiveGameButton(gameId) {
    document.querySelectorAll(".game-item-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.id === gameId);
    });
    navHome.classList.remove("active");
    navContact.classList.remove("active");
  }

  function showHomeView(loadFeatured = true) {
    homeView.classList.remove("hidden");
    contactView.classList.add("hidden");
    if (loadFeatured) {
      navHome.classList.add("active");
      navContact.classList.remove("active");
      document.querySelectorAll(".game-item-btn").forEach((b) => b.classList.remove("active"));
      heroSection.classList.remove("hidden");
      loadGame(featuredGame, true);
    }
  }

  navHome.addEventListener("click", (e) => {
    e.preventDefault();
    showHomeView(true);
    closeSidebar();
  });

  navContact.addEventListener("click", (e) => {
    e.preventDefault();
    homeView.classList.add("hidden");
    contactView.classList.remove("hidden");
    navContact.classList.add("active");
    navHome.classList.remove("active");
    document.querySelectorAll(".game-item-btn").forEach((b) => b.classList.remove("active"));
    closeSidebar();
  });

  directoryToggle.addEventListener("click", () => {
    const isHidden = gameListEl.classList.toggle("hidden");
    directoryChevron.classList.toggle("collapsed", isHidden);
    directoryToggle.setAttribute("aria-expanded", String(!isHidden));
  });

  searchBtn.addEventListener("click", () => {
    searchInput.classList.toggle("open");
    if (searchInput.classList.contains("open")) {
      searchInput.focus();
    } else {
      searchInput.value = "";
      renderGameDirectory(allGames);
    }
  });

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    const filtered = allGames.filter((game) =>
      game.title.toLowerCase().includes(query)
    );
    gameListEl.classList.remove("hidden");
    directoryChevron.classList.remove("collapsed");
    renderGameDirectory(filtered);
  });

  fullscreenBtn.addEventListener("click", async () => {
    if (playerCard.classList.contains("pseudo-fullscreen")) {
      playerCard.classList.remove("pseudo-fullscreen");
      return;
    }
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (playerCard.requestFullscreen) {
        await playerCard.requestFullscreen();
      } else if (playerCard.webkitRequestFullscreen) {
        playerCard.webkitRequestFullscreen();
      } else {
        playerCard.classList.add("pseudo-fullscreen");
      }
    } catch {
      playerCard.classList.add("pseudo-fullscreen");
    }
  });

  mobileMenuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    sidebarBackdrop.classList.toggle("open");
  });

  sidebarBackdrop.addEventListener("click", closeSidebar);
});