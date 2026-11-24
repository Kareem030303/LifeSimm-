(() => {
  const ERA_NAMES = {
    medieval: {
      male: ["Aethelred", "Godwin", "Oswin", "Baldric", "Gawain", "Alaric", "Cedric", "Torin"],
      female: ["Matilda", "Elowen", "Beatrix", "Isolde", "Rosamund", "Aveline", "Morganna", "Sybil"],
      surnames: ["Ashford", "Blackwood", "Thorne", "Vane", "Dunmore", "Fletcher", "Hawke", "Mercer"]
    },
    industrial: {
      male: ["Arthur", "Walter", "Ernest", "Clarence", "Harold", "August", "Leonard", "Frederick"],
      female: ["Clara", "Florence", "Mabel", "Edith", "Hazel", "Ethel", "Lillian", "Winifred"],
      surnames: ["Sterling", "Kowalski", "Bauer", "Morrison", "Castellano", "Patel", "Okafor", "Lindqvist"]
    },
    modern: {
      male: ["Liam", "Noah", "Mateo", "Julian", "Owen", "Devon", "Caleb", "Ethan"],
      female: ["Maya", "Elena", "Sora", "Nadia", "Tessa", "Leah", "Zoe", "Chloe"],
      surnames: ["Mercer", "Vance", "Chen", "Alvarez", "Patel", "Okafor", "Lindqvist", "Morrison"]
    },
    future: {
      male: ["Kael", "Orion", "Zed", "Jaxon", "Cyrus", "Vael", "Solis", "Aether"],
      female: ["Lyra", "Nova", "Vesper", "Aria", "Soren", "Celeste", "Echo", "Zara"],
      surnames: ["Vanguard", "Helios", "Solstice", "Kestrel", "Nova", "Axiom", "Drift", "Meridian"]
    }
  };

  const ERA_EVENTS = {
    medieval: {
      young: [
        "Helped haul water from the village well and listened to traveling minstrels in the square.",
        "Watched the blacksmith hammer glowing iron while learning how to mend tools.",
        "Picked wild berries along the forest edge before dusk bells rang across the manor."
      ],
      adult: [
        "A harvest tax collector arrived in town, forcing tough choices between coin, grain, and goodwill.",
        "A guild master offered you a steady trade assignment—working long hours for solid coin and craft skill.",
        "A royal courier rode through with news of border shifts and bustling market days."
      ],
      elder: [
        "Younger villagers sought your counsel on weather signs, land disputes, and old family tales.",
        "Quiet evenings by the hearth brought reflection on decades spent in the realm."
      ]
    },
    industrial: {
      young: [
        "Watched steam locomotives puff into the station and read serialized adventure papers.",
        "Ran errands around bustling brick workshops and learned how machines keep time."
      ],
      adult: [
        "New factory shifts and telegraph dispatches reshaped work around town this year.",
        "A civic newspaper cover story sparked lively debate in the local cafés and halls."
      ],
      elder: [
        "You looked back on how fast streetlamps, rail lines, and city blocks changed in your lifetime."
      ]
    },
    modern: {
      young: [
        "Spent the year between school, neighborhood hangouts, and early hobbies.",
        "Picked up new digital tools and shared stories with friends."
      ],
      adult: [
        "Remote work trends, side projects, and fast-moving headlines shaped your daily routine.",
        "A career or lifestyle opportunity popped up that tested your balance between money and free time."
      ],
      elder: [
        "Looking back over decades of rapid tech shifts, family memories mattered most."
      ]
    },
    future: {
      young: [
        "Took holo-mentoring pods and practiced zero-G balance drills in the habitat commons.",
        "Explored hydroponic garden domes and watched orbital shuttles arc overhead."
      ],
      adult: [
        "An orbital supply shift and a new bio-tech/engineering contract opened fresh paths.",
        "Habitat council votes on air/energy quotas sparked busy debates across sectors."
      ],
      elder: [
        "From early orbital habitats to deep-space relays, you saw a whole new frontier take shape."
      ]
    }
  };

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  function getEraKey(year) {
    const y = parseInt(year, 10);
    if (isNaN(y) || y < 1500) return "medieval";
    if (y < 1950) return "industrial";
    if (y < 2100) return "modern";
    return "future";
  }

  function applyEraNamesToSetup() {
    const yearInput = document.getElementById("inpYear");
    const nameInput = document.getElementById("inpName");
    const genderSelect = document.getElementById("selGender");
    if (!yearInput || !nameInput) return;

    const eraKey = getEraKey(yearInput.value);
    const pool = ERA_NAMES[eraKey];
    if (!pool) return;

    const gender = genderSelect ? genderSelect.value : "Male";
    const firstPool = gender === "Female" ? pool.female : pool.male;
    const suggested = `${pick(firstPool)} ${pick(pool.surnames)}`;

    // Only replace if user hasn't typed a custom name or clicks preset/era button
    if (nameInput.dataset.userEdited !== "true") {
      nameInput.value = suggested;
    }
  }

  function injectTimelineEventOnAgeUp() {
    const state = window.state;
    if (!state || !state.alive) return;

    const eraKey = getEraKey(state.year);
    const bucket = ERA_EVENTS[eraKey] || ERA_EVENTS.modern;
    const pool =
      state.age < 15 ? bucket.young :
      state.age >= 60 ? bucket.elder :
      bucket.adult;

    const headline = pick(pool);
    const deltaHappy = pick([-3, 2, 4, 6]);
    const deltaWealth = eraKey === "medieval" && state.age >= 15 ? pick([-4, 3, 6]) : pick([-2, 2, 5]);

    state.stats.happiness = clamp(state.stats.happiness + deltaHappy, 0, 100);
    state.stats.wealth = clamp(state.stats.wealth + deltaWealth, 0, 100);

    state.log.unshift({
      year: state.year,
      age: state.age,
      text: `[${eraKey.toUpperCase()} TIMELINE] ${headline}`,
      kind: "mil"
    });

    const logEl = document.getElementById("lifeLog");
    if (logEl) {
      logEl.innerHTML = state.log
        .map(
          (entry) => `
        <div class="log-entry ${entry.kind || ""}">
          <div class="muted">Age ${entry.age} • Year ${entry.year}</div>
          <div>${entry.text}</div>
        </div>
      `
        )
        .join("");
    }
  }

  // Track if user manually edits the name box
  const nameInput = document.getElementById("inpName");
  if (nameInput) {
    nameInput.addEventListener("input", () => {
      nameInput.dataset.userEdited = "true";
    });
  }

  const yearInput = document.getElementById("inpYear");
  if (yearInput) {
    yearInput.addEventListener("change", () => {
      nameInput.dataset.userEdited = "false";
      applyEraNamesToSetup();
      const regenBtn = document.getElementById("btnRegenFamily");
      if (regenBtn) regenBtn.click();
    });
  }

  // Hook preset buttons so picking Medieval/1900/Modern/Sci-Fi updates era names too
  ["btnPresetMed", "btnPreset1900", "btnPresetMod", "btnPresetSciFi"].forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener("click", () => {
        setTimeout(() => {
          if (nameInput) nameInput.dataset.userEdited = "false";
          applyEraNamesToSetup();
          const regenBtn = document.getElementById("btnRegenFamily");
          if (regenBtn) regenBtn.click();
        }, 0);
      });
    }
  });

  // Trigger an era/timeline event every time "Advance 1 Year" is clicked
  const ageBtn = document.getElementById("btnAgeUp");
  if (ageBtn) {
    ageBtn.addEventListener("click", () => {
      setTimeout(injectTimelineEventOnAgeUp, 0);
    });
  }

  // Also trigger whenever a choice button advances the year
  document.addEventListener("click", (e) => {
    const target = e.target;
    if (target && target.classList && target.classList.contains("choice-btn")) {
      setTimeout(injectTimelineEventOnAgeUp, 0);
    }
  });
})();
