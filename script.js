document.addEventListener("DOMContentLoaded", () => {
  /*
    =========================================================
    Nuestro pequeño universo — script.js
    Flujo:
    1) Portada
    2) Carta de bienvenida
    3) Dashboard

    Además:
    - La navbar se oculta durante la introducción.
    - La navbar aparece únicamente al entrar al dashboard.
    - Sus enlaces ya funcionan dentro del dashboard.
    - Se deja la base lista para futuras interacciones.
    =========================================================
  */

  const app = {
    elements: {
      body: document.body,
      navbar: document.querySelector(".navbar"),
      navLinks: document.querySelectorAll(".menu a"),
      starfield: document.getElementById("starfield"),

      heroScreen: document.getElementById("heroScreen"),
      welcomeScreen: document.getElementById("welcomeScreen"),
      dashboardScreen: document.getElementById("dashboardScreen"),

      enterBtn: document.getElementById("enterBtn"),
      continueBtn: document.getElementById("continueBtn"),
    },

    settings: {
      sceneExitDuration: 720,
      sceneEnterCleanup: 950,
      starCount: 120,
      shootingStarInterval: 9000,
      useReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    },

    currentScene: "hero",

    init() {
      this.setInitialState();
      this.createStarfield();
      this.bindSceneEvents();
      this.bindNavigation();
      this.initHorizontalCollections();
      this.initPromiseLetter();
      this.initSpecialLetters();
      this.initAnniversaryChapters();
      this.initTimelineStories();
      this.initPendingControls();
      this.initFutureModules();
    },

    /* =====================================================
       ESTADO INICIAL
    ===================================================== */
    setInitialState() {
      const {
        body,
        navbar,
        heroScreen,
        welcomeScreen,
        dashboardScreen,
      } = this.elements;

      if (heroScreen) {
        heroScreen.hidden = false;
        heroScreen.classList.remove("screen-enter", "screen-exit");
      }

      if (welcomeScreen) {
        welcomeScreen.hidden = true;
        welcomeScreen.classList.remove("screen-enter", "screen-exit");
      }

      if (dashboardScreen) {
        dashboardScreen.hidden = true;
        dashboardScreen.classList.remove("screen-enter", "screen-exit");
      }

      if (navbar) {
        navbar.classList.add("navbar-intro-hidden");
      }

      if (body) {
        body.style.overflowX = "hidden";
        body.style.overflowY = "hidden";
      }

      window.scrollTo(0, 0);
    },

    /* =====================================================
       BOTONES DE LAS ESCENAS
    ===================================================== */
    bindSceneEvents() {
      const { enterBtn, continueBtn } = this.elements;

      if (enterBtn) {
        enterBtn.addEventListener("click", () => {
          this.goFromHeroToWelcome();
        });
      }

      if (continueBtn) {
        continueBtn.addEventListener("click", () => {
          this.goFromWelcomeToDashboard();
        });
      }
    },

    /* =====================================================
       PORTADA -> CARTA
    ===================================================== */
    goFromHeroToWelcome() {
      if (this.currentScene !== "hero") return;

      const { heroScreen, welcomeScreen } = this.elements;

      if (!heroScreen || !welcomeScreen) return;

      this.currentScene = "transitioning";

      this.disablePointer(heroScreen);
      this.disablePointer(welcomeScreen);

      if (this.settings.useReducedMotion) {
        heroScreen.hidden = true;
        welcomeScreen.hidden = false;

        this.enablePointer(welcomeScreen);

        this.currentScene = "welcome";

        return;
      }

      heroScreen.classList.add("screen-exit");

      window.setTimeout(() => {
        heroScreen.hidden = true;

        heroScreen.classList.remove("screen-exit");

        welcomeScreen.hidden = false;

        requestAnimationFrame(() => {
          welcomeScreen.classList.add("screen-enter");
        });

        window.setTimeout(() => {
          welcomeScreen.classList.remove("screen-enter");

          this.enablePointer(welcomeScreen);

          this.currentScene = "welcome";
        }, this.settings.sceneEnterCleanup);

      }, this.settings.sceneExitDuration);
    },

    /* =====================================================
       CARTA -> DASHBOARD
    ===================================================== */
    goFromWelcomeToDashboard() {
      if (this.currentScene !== "welcome") return;

      const {
        body,
        navbar,
        welcomeScreen,
        dashboardScreen,
      } = this.elements;

      if (!welcomeScreen || !dashboardScreen) return;

      this.currentScene = "transitioning";

      this.disablePointer(welcomeScreen);
      this.disablePointer(dashboardScreen);

      if (this.settings.useReducedMotion) {
        welcomeScreen.hidden = true;
        dashboardScreen.hidden = false;

        if (navbar) {
          navbar.classList.remove("navbar-intro-hidden");
        }

        if (body) {
          body.style.overflowY = "auto";
        }

        this.enablePointer(dashboardScreen);

        this.currentScene = "dashboard";

        return;
      }

      welcomeScreen.classList.add("screen-exit");

      window.setTimeout(() => {
        welcomeScreen.hidden = true;

        welcomeScreen.classList.remove("screen-exit");

        if (navbar) {
          navbar.classList.remove("navbar-intro-hidden");
          navbar.classList.add("navbar-enter");

          window.setTimeout(() => {
            navbar.classList.remove("navbar-enter");
          }, 750);
        }

        dashboardScreen.hidden = false;

        requestAnimationFrame(() => {
          dashboardScreen.classList.add("screen-enter");
        });

        window.setTimeout(() => {
          dashboardScreen.classList.remove("screen-enter");

          if (body) {
            body.style.overflowY = "auto";
          }

          this.enablePointer(dashboardScreen);

          this.currentScene = "dashboard";
        }, this.settings.sceneEnterCleanup);

      }, this.settings.sceneExitDuration);
    },

    /* =====================================================
       NAVEGACIÓN SUPERIOR
    ===================================================== */
    bindNavigation() {
      const { navLinks, dashboardScreen } = this.elements;

      const sectionMap = {
        "inicio": dashboardScreen,
        "nuestra historia": document.querySelector(".card.historia"),
        "recuerdos": document.querySelector(".card.recuerdos"),
        "cartas": document.querySelector(".card.cartas"),
        "playlist": document.querySelector(".card.playlist"),
        "metas": document.querySelector(".card.metas"),
        "aniversarios": document.querySelector(".card.futuros"),
      };

      navLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
          event.preventDefault();

          if (this.currentScene !== "dashboard") return;

          const key = link.textContent.trim().toLowerCase();

          const target = sectionMap[key];

          if (!target) return;

          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        });
      });
    },

    /* =====================================================
       COLECCIONES HORIZONTALES
    ===================================================== */
    initHorizontalCollections() {
      const collections = document.querySelectorAll(
        ".polaroid-grid, .envelope-grid"
      );

      collections.forEach((container) => {
        let isDragging = false;
        let startX = 0;
        let startScrollLeft = 0;
        let movedDistance = 0;
        let suppressClick = false;

        container.addEventListener("pointerdown", (event) => {
          if (event.pointerType !== "mouse") return;
          if (event.button !== 0) return;

          if (container.scrollWidth <= container.clientWidth) return;

          isDragging = true;
          movedDistance = 0;
          suppressClick = false;

          startX = event.clientX;
          startScrollLeft = container.scrollLeft;

          container.classList.add("is-dragging");

          try {
            container.setPointerCapture(event.pointerId);
          } catch (_) {}
        });

        container.addEventListener("pointermove", (event) => {
          if (!isDragging) return;
          if (event.pointerType !== "mouse") return;

          const deltaX = event.clientX - startX;

          movedDistance = Math.max(
            movedDistance,
            Math.abs(deltaX)
          );

          if (movedDistance > 4) {
            event.preventDefault();

            suppressClick = true;
          }

          container.scrollLeft =
            startScrollLeft - deltaX;
        });

        const finishDrag = (event) => {
          if (!isDragging) return;

          isDragging = false;

          container.classList.remove("is-dragging");

          try {
            if (
              container.hasPointerCapture(event.pointerId)
            ) {
              container.releasePointerCapture(
                event.pointerId
              );
            }
          } catch (_) {}

          if (suppressClick) {
            window.setTimeout(() => {
              suppressClick = false;
            }, 80);
          }
        };

        container.addEventListener(
          "pointerup",
          finishDrag
        );

        container.addEventListener(
          "pointercancel",
          finishDrag
        );

        container.addEventListener(
          "lostpointercapture",
          () => {
            if (!isDragging) return;

            isDragging = false;

            container.classList.remove(
              "is-dragging"
            );
          }
        );

        container.addEventListener(
          "click",
          (event) => {
            if (!suppressClick) return;

            event.preventDefault();

            event.stopPropagation();
          },
          true
        );
      });
    },

    /* =====================================================
       UTILIDADES
    ===================================================== */
    disablePointer(element) {
      if (!element) return;

      element.style.pointerEvents = "none";
    },

    enablePointer(element) {
      if (!element) return;

      element.style.pointerEvents = "";
    },

    /* =====================================================
       ESTRELLAS
    ===================================================== */
    createStarfield() {
      const { starfield } = this.elements;

      if (!starfield) return;

      starfield.innerHTML = "";

      for (
        let i = 0;
        i < this.settings.starCount;
        i++
      ) {
        const star =
          document.createElement("span");

        star.classList.add("star");

        const size =
          Math.random() * 2.6 + 0.7;

        star.style.width =
          `${size}px`;

        star.style.height =
          `${size}px`;

        star.style.top =
          `${Math.random() * 100}%`;

        star.style.left =
          `${Math.random() * 100}%`;

        star.style.opacity =
          `${Math.random() * 0.75 + 0.2}`;

        star.style.animationDuration =
          `${2.5 + Math.random() * 4}s`;

        star.style.animationDelay =
          `${Math.random() * 5}s`;

        starfield.appendChild(star);
      }

      this.createShootingStar();

      this.startShootingStarLoop();
    },

    createShootingStar() {
      if (
        document.querySelector(
          ".shooting-star"
        )
      ) {
        return;
      }

      const shootingStar =
        document.createElement("div");

      shootingStar.classList.add(
        "shooting-star"
      );

      document.body.appendChild(
        shootingStar
      );
    },

    startShootingStarLoop() {
      const shootingStar =
        document.querySelector(
          ".shooting-star"
        );

      if (
        !shootingStar ||
        this.settings.useReducedMotion
      ) {
        return;
      }

      const relaunch = () => {
        shootingStar.style.animation =
          "none";

        void shootingStar.offsetWidth;

        shootingStar.style.animation =
          "";
      };

      relaunch();

      window.setInterval(() => {
        relaunch();
      }, this.settings.shootingStarInterval);
    },

    /* =====================================================
       NUESTRA PROMESA
    ===================================================== */
    initPromiseLetter() {
      const openBtn =
        document.getElementById(
          "promiseCard"
        );

      const modal =
        document.getElementById(
          "promiseModal"
        );

      const closeBtn =
        document.getElementById(
          "promiseModalClose"
        );

      if (!openBtn || !modal) return;

      let closeTimer = null;

      const openPromise = () => {
        window.clearTimeout(closeTimer);

        document.body.dataset.promiseOverflowY =
          document.body.style.overflowY || "";

        document.body.style.overflowY =
          "hidden";

        modal.hidden = false;

        modal.setAttribute(
          "aria-hidden",
          "false"
        );

        requestAnimationFrame(() => {
          modal.classList.add("is-open");

          if (closeBtn) {
            closeBtn.focus({
              preventScroll: true
            });
          }
        });
      };

      const closePromise = () => {
        if (modal.hidden) return;

        modal.classList.remove(
          "is-open"
        );

        modal.setAttribute(
          "aria-hidden",
          "true"
        );

        closeTimer =
          window.setTimeout(() => {
            modal.hidden = true;

            document.body.style.overflowY =
              document.body.dataset
                .promiseOverflowY ||
              "auto";

            delete document.body.dataset
              .promiseOverflowY;

            openBtn.focus({
              preventScroll: true
            });
          }, 280);
      };

      openBtn.addEventListener(
        "click",
        openPromise
      );

      if (closeBtn) {
        closeBtn.addEventListener(
          "click",
          closePromise
        );
      }

      modal.addEventListener(
        "click",
        (event) => {
          if (
            event.target === modal ||
            event.target.classList.contains(
              "promise-modal-backdrop"
            )
          ) {
            closePromise();
          }
        }
      );

      document.addEventListener(
        "keydown",
        (event) => {
          if (
            event.key === "Escape" &&
            !modal.hidden
          ) {
            closePromise();
          }
        }
      );
    },

    /* =====================================================
       CARTAS PARA MOMENTOS ESPECIALES
    ===================================================== */
    initSpecialLetters() {
      const LETTERS = {
        "dia-dificil": {
          title:
            "Cuando tengas un día difícil",

          html: `
            <p><strong>Mi niñita hermosa:</strong></p>

            <p>Si estás leyendo esto, probablemente hoy no fue uno de esos días bonitos. Y aunque quisiera poder estar ahí contigo para abrazarte y hacer que todo se sintiera un poquito más ligero, quiero que recuerdes que no tienes que estar bien todo el tiempo.</p>

            <p>Puedes cansarte. Puedes tener días malos. Puedes sentir que todo te supera un poquito. Y está bien.</p>

            <p>No quiero que olvides que hay alguien al otro lado pensando en ti, queriéndote y deseando poder acompañarte incluso en esos días que no son tan fáciles.</p>

            <p>Así que respira, descansa un poquito y no seas tan dura contigo.</p>

            <p>Mañana habrá nuevas cosas que vivir, nuevas conversaciones, nuevas risas y muchos momentos que todavía nos faltan.</p>

            <p>Y si hoy necesitas que alguien te recuerde que eres importante, aquí estoy.</p>

            <p><strong>Te amo muchísimo, mi Xime. ♡</strong></p>
          `
        },

        "me-extranes": {
          title:
            "Cuando me extrañes",

          html: `
            <p><strong>Mi cielo estrellado:</strong></p>

            <p>Si me estás extrañando, quiero que pienses en algo.</p>

            <p>Aunque estemos lejos, hay algo bonito en saber que en algún lugar también estoy pensando en ti.</p>

            <p>Piensa en todas nuestras llamadas que parecían durar minutos aunque fueran horas, en nuestras conversaciones, en todas esas pequeñas cosas que poco a poco se volvieron nuestras.</p>

            <p>A veces quisiera poder simplemente aparecer ahí contigo, abrazarte y quedarme un rato sin tener que despedirme.</p>

            <p>Pero mientras llega el momento en que podamos compartir muchas más cosas juntas, quiero que guardes nuestros recuerdos cerquita.</p>

            <p>Porque aunque existan kilómetros entre nosotros, <strong>seguimos mirando el mismo cielo.</strong></p>

            <p>Y cada vez que me extrañes, recuerda que yo también tengo un lugar donde guardarte.</p>

            <p><strong>Aquí. ♡</strong></p>
          `
        },

        "dudes-nosotros": {
          title:
            "Cuando dudes de nosotros",

          html: `
            <p><strong>Mi Xime:</strong></p>

            <p>Si alguna vez llegas a dudar de nosotros, quiero que vuelvas al principio.</p>

            <p>A aquel primer mensaje de diciembre de 2023. A todo lo que pasó después. A ese reencuentro que ninguno de los dos sabía hasta dónde iba a llevarnos.</p>

            <p>Recuerda nuestras primeras conversaciones, aquella primera llamada que terminó convirtiéndose en horas que se sintieron como minutos.</p>

            <p>Recuerda todo lo que tuvo que pasar para que finalmente llegáramos hasta aquí.</p>

            <p>No tenemos que saber exactamente qué va a pasar mañana.</p>

            <p>Estamos aprendiendo a conocernos, a entendernos y a construir nuestra propia historia.</p>

            <p>Y creo que eso también es bonito.</p>

            <p>Porque nuestra historia no llegó terminada. <strong>La estamos escribiendo juntas.</strong></p>

            <p>Así que si alguna vez dudas, vuelve aquí.</p>

            <p>Y recuerda que, entre tantas posibilidades, nosotras nos encontramos.</p>

            <p><strong>Y yo todavía quiero descubrir todo lo que nos falta vivir. ♡</strong></p>
          `
        },

        "recordar-amor": {
          title:
            "Cuando necesites recordar cuánto te amo",

          html: `
            <p><strong>Para mi niñita hermosa:</strong></p>

            <p>Quiero que esta carta sea un pequeño recordatorio de algo que quizá nunca debería hacer falta recordar:</p>

            <p><strong>te amo.</strong></p>

            <p>Te amo por las cosas que conozco de ti y también por todas las que todavía estoy descubriendo.</p>

            <p>Te amo por nuestras conversaciones, por nuestras llamadas, por las risas, por las pequeñas tonterías que terminan convirtiéndose en recuerdos que quiero guardar.</p>

            <p>Te amo por cómo poco a poco te fuiste convirtiendo en alguien tan importante para mí.</p>

            <p>Y quizá lo que más me gusta de nosotros es que nuestra historia apenas está comenzando.</p>

            <p>Todavía nos falta nuestra primera cita presencial, todavía nos faltan muchísimas fotos, viajes, lugares, tardes, noches, cumpleaños y recuerdos que todavía ni siquiera existen.</p>

            <p>Quiero conocer todas esas versiones de ti que todavía no conozco.</p>

            <p>Quiero seguir construyendo esto contigo.</p>

            <p>Así que si algún día necesitas recordar cuánto te amo, vuelve a abrir esta carta.</p>

            <p>Y aunque pasen meses o años, quiero que encuentres aquí la misma respuesta:</p>

            <p>
              <strong>
                Te amo muchísimo, mi Xime.<br>
                Mi cielo estrellado.<br>
                Y quiero seguir haciendo de nosotros, nosotros. ♡
              </strong>
            </p>
          `
        }
      };

      const modal =
        document.getElementById(
          "specialLetterModal"
        );

      const title =
        document.getElementById(
          "specialLetterTitle"
        );

      const content =
        document.getElementById(
          "specialLetterContent"
        );

      const closeBtn =
        document.getElementById(
          "specialLetterClose"
        );

      const cards =
        document.querySelectorAll(
          ".cartas .special-letter-card"
        );

      if (
        !modal ||
        !title ||
        !content ||
        !cards.length
      ) {
        return;
      }

      let activeCard = null;
      let closeTimer = null;

      const openLetter = (card) => {
        const key =
          card.dataset.specialLetter;

        const letter =
          LETTERS[key];

        if (!letter) return;

        activeCard = card;

        title.textContent =
          letter.title;

        content.innerHTML =
          letter.html;

        const scrollArea =
          modal.querySelector(
            ".special-letter-scroll"
          );

        if (scrollArea) {
          scrollArea.scrollTop = 0;
        }

        window.clearTimeout(
          closeTimer
        );

        document.body.dataset
          .specialLetterOverflowY =
          document.body.style
            .overflowY ||
          "";

        document.body.style
          .overflowY =
          "hidden";

        modal.hidden = false;

        modal.setAttribute(
          "aria-hidden",
          "false"
        );

        requestAnimationFrame(
          () => {
            modal.classList.add(
              "is-open"
            );

            if (closeBtn) {
              closeBtn.focus({
                preventScroll: true
              });
            }
          }
        );
      };

      const closeLetter = () => {
        if (modal.hidden) return;

        modal.classList.remove(
          "is-open"
        );

        modal.setAttribute(
          "aria-hidden",
          "true"
        );

        closeTimer =
          window.setTimeout(
            () => {
              modal.hidden =
                true;

              document.body.style
                .overflowY =
                document.body.dataset
                  .specialLetterOverflowY ||
                "auto";

              delete document.body
                .dataset
                .specialLetterOverflowY;

              if (activeCard) {
                activeCard.focus({
                  preventScroll: true
                });
              }

              activeCard = null;
            },
            280
          );
      };

      cards.forEach(
        (card) => {
          card.addEventListener(
            "click",
            () => {
              openLetter(card);
            }
          );

          card.addEventListener(
            "keydown",
            (event) => {
              if (
                event.key === "Enter" ||
                event.key === " "
              ) {
                event.preventDefault();

                openLetter(card);
              }
            }
          );
        }
      );

      if (closeBtn) {
        closeBtn.addEventListener(
          "click",
          closeLetter
        );
      }

      modal.addEventListener(
        "click",
        (event) => {
          if (
            event.target === modal ||
            event.target
              .classList
              .contains(
                "special-letter-backdrop"
              )
          ) {
            closeLetter();
          }
        }
      );

      document.addEventListener(
        "keydown",
        (event) => {
          if (
            event.key === "Escape" &&
            !modal.hidden
          ) {
            closeLetter();
          }
        }
      );
    },

    /* =====================================================
       CAPÍTULOS / ANIVERSARIOS DINÁMICOS
    ===================================================== */
    initAnniversaryChapters() {
      const TEST_MODE = false;

      const CHAPTERS = [
        {
          id: "mes-2",
          title: "Mes 2",
          unlockDate: "2026-10-23",
          intro:
            "Hoy cumplimos dos meses siendo nosotros.",

          content: `
            <article class="month-letter month-letter-two">

              <div class="month-letter-header">

                <span class="month-letter-mark">
                  ♡
                </span>

                <p class="month-letter-eyebrow">
                  23 de octubre de 2026
                </p>

                <h3>
                  Feliz 2 mesesaurio
                </h3>

                <p class="month-letter-subtitle">
                  Dos meses siendo nosotros.
                </p>

              </div>

              <div
                class="month-letter-divider"
                aria-hidden="true"
              >
                <span></span>
                <b>✦</b>
                <span></span>
              </div>

              <div class="month-letter-copy">

                <p>
                  <strong>
                    Mi Ximenita hermosa...
                  </strong>
                </p>

                <p>
                  Feliz 2 mesesaurio mi niña
                </p>

                <p>
                  Hoy me hace muy feliz poder decir que ya llevamos dos meses siendo nosotros. Y aunque dos meses puedan parecer poquito, cuando pienso en todo lo que hay detrás de ellos siento que tenemos muchísimo que celebrar.
                </p>

                <p>
                  Nuestra historia empezó mucho antes de este 23 de agosto. Desde aquel primer mensaje, todas esas conversaciones, las llamadas, los juegos, las cosas que fuimos descubriendo del otro y todos esos pequeños momentos que, sin darnos cuenta, nos fueron acercando hasta llegar a donde estamos hoy.
                </p>

                <p>
                  Y qué bonito se siente pensar que, entre tantas personas y tantos caminos que pudieron existir, terminamos encontrándonos nosotros.
                </p>

                <p>
                  Me encanta tenerte en mi vida mi cielo. Me encantan nuestras conversaciones, nuestras tonterías, cuando jugamos juntos, cuando nos contamos cualquier cosa y esas veces en las que simplemente estar contigo hace que mi día se sienta diferente.
                </p>

                <p>
                  Pero también me gusta que lo nuestro sea real. No todo ha sido perfecto y creo que tampoco tiene que serlo. Hemos tenido momentos muy bonitos y otros en los que nos ha tocado aprender, escucharnos y entendernos un poquito más. Y aun así aquí seguimos.
                </p>

                <p>
                  Eso también es algo que valoro muchísimo de nosotros.
                </p>

                <p>
                  No quiero que estos dos meses sean solamente una fecha bonita. Quiero que algún día podamos mirar hacia atrás y recordar que esto fue apenas el comienzo de una historia mucho más grande.
                </p>

                <p>
                  Me emociona pensar en todo lo que todavía nos falta.
                </p>

                <p>
                  Conocernos en persona. Poder abrazarte por fin. Tener nuestras primeras fotos juntos. Viajar. Conocer lugares nuevos. Hacer planes que ahora solamente podemos imaginar. Tener días completamente normales juntos y descubrir que incluso esos días pueden convertirse en nuestros favoritos.
                </p>

                <p>
                  Y más adelante, quién sabe... quizá algún día podamos mirar todo lo que construimos y reconocer en nuestra vida a aquellas dos personas que empezaron queriéndose desde lejos.
                </p>

                <p>
                  Me gusta imaginar ese futuro contigo.
                </p>

                <p>
                  No porque necesite saber exactamente qué va a pasar, sino porque cuando pienso en las cosas bonitas que todavía me gustaría vivir, naturalmente apareces tú en ellas.
                </p>

                <p>
                  Así que gracias mi niñita
                </p>

                <p>
                  Gracias por cada llamada, cada mensaje, cada partida, cada risa, cada conversación y también por todos esos momentos que solamente nosotros entendemos.
                </p>

                <p>
                  Gracias por ser tú y por dejarme formar parte de tu vida.
                </p>

                <p class="month-letter-emphasis">
                  <strong>
                    Te amo muchísimo mi pequeña.
                  </strong>
                </p>

                <p>
                  Y espero que este sea solamente uno de muchísimos mesesaurios que podamos celebrar juntos.
                </p>

                <p>
                  Que sigamos escribiendo nuestra historia poquito a poquito, sin importar cuántos kilómetros haya entre nosotros.
                </p>

                <p>
                  Porque si algo me gusta de nuestra historia es que todavía nos quedan <strong>muchísimos capítulos por vivir.</strong>
                </p>

                <p class="month-letter-ending">
                  <strong>
                    Feliz 2 mesesaurio, mi Ximenita hermosa
                  </strong>
                </p>

              </div>

            </article>
          `
        },

        {
          id: "mes-3",
          title: "Mes 3",
          unlockDate: "2026-11-23",
          intro:
            "Tres meses, nuevas historias y otro capítulo para nosotros.",

          content: `
            <div class="chapter-content-placeholder">
              Aquí podrás agregar el contenido especial de nuestro tercer mes.
            </div>
          `
        },

        {
          id: "mes-4",
          title: "Mes 4",
          unlockDate: "2026-12-23",
          intro:
            "Nuestra historia sigue creciendo, un capítulo a la vez.",

          content: `
            <div class="chapter-content-placeholder">
              Aquí podrás agregar el contenido especial de nuestro cuarto mes.
            </div>
          `
        },

        {
          id: "mes-5",
          title: "5 meses",
          unlockDate: "2027-01-23",
          intro:
            "Cinco meses de momentos que merecen tener su propio lugar.",

          content: `
            <div class="chapter-content-placeholder">
              Aquí podrás agregar el contenido especial de nuestros cinco meses.
            </div>
          `
        },

        {
          id: "mes-6",
          title: "6 meses",
          unlockDate: "2027-02-23",
          intro:
            "Medio año de nuestra historia merece abrirse como un capítulo especial.",

          content: `
            <div class="chapter-content-placeholder">
              Aquí podrás construir un capítulo más grande para nuestros seis meses.
            </div>
          `
        },

        {
          id: "anio-1",
          title: "1 año",
          unlockDate: "2027-08-23",
          intro:
            "Un año. Todo un universo de momentos que empezó con nosotros.",

          content: `
            <div class="chapter-content-placeholder">
              Aquí podrás crear el capítulo completo de nuestro primer aniversario.
            </div>
          `
        }
      ];

      const chaptersGrid =
        document.getElementById(
          "chaptersGrid"
        );

      const introScreen =
        document.getElementById(
          "chapterIntroScreen"
        );

      const introTitle =
        document.getElementById(
          "chapterIntroTitle"
        );

      const introMessage =
        document.getElementById(
          "chapterIntroMessage"
        );

      const introCloseBtn =
        document.getElementById(
          "chapterIntroCloseBtn"
        );

      const chapterContinueBtn =
        document.getElementById(
          "chapterContinueBtn"
        );

      const contentScreen =
        document.getElementById(
          "chapterContentScreen"
        );

      const contentTitle =
        document.getElementById(
          "chapterContentTitle"
        );

      const contentDate =
        document.getElementById(
          "chapterContentDate"
        );

      const contentBody =
        document.getElementById(
          "chapterContentBody"
        );

      const contentCloseBtn =
        document.getElementById(
          "chapterContentCloseBtn"
        );

      const chapterBackBtn =
        document.getElementById(
          "chapterBackBtn"
        );

      if (!chaptersGrid) return;

      let selectedChapter = null;
      let toastTimer = null;

      const parseLocalDate =
        (isoDate) => {
          const [
            year,
            month,
            day
          ] =
            isoDate
              .split("-")
              .map(Number);

          return new Date(
            year,
            month - 1,
            day,
            0,
            0,
            0,
            0
          );
        };

      const today =
        new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );

      const formatDate =
        (date) =>
          new Intl.DateTimeFormat(
            "es-MX",
            {
              day: "numeric",
              month: "long",
              year: "numeric"
            }
          ).format(date);

      const isUnlocked =
        (chapter) =>
          TEST_MODE ||
          today >=
            parseLocalDate(
              chapter.unlockDate
            );

      const createToast = () => {
        let toast =
          document.querySelector(
            ".chapter-toast"
          );

        if (!toast) {
          toast =
            document.createElement(
              "div"
            );

          toast.className =
            "chapter-toast";

          toast.setAttribute(
            "role",
            "status"
          );

          toast.setAttribute(
            "aria-live",
            "polite"
          );

          document.body.appendChild(
            toast
          );
        }

        return toast;
      };

      const showLockedMessage =
        (chapter, card) => {
          const unlockDate =
            parseLocalDate(
              chapter.unlockDate
            );

          const toast =
            createToast();

          toast.textContent =
            `Este capítulo se desbloquea el ${formatDate(
              unlockDate
            )}. ♡`;

          toast.classList.add(
            "show"
          );

          card.classList.remove(
            "locked-feedback"
          );

          void card.offsetWidth;

          card.classList.add(
            "locked-feedback"
          );

          window.clearTimeout(
            toastTimer
          );

          toastTimer =
            window.setTimeout(
              () => {
                toast.classList.remove(
                  "show"
                );
              },
              2600
            );
        };

      const lockPage = () => {
        document.body.dataset
          .previousOverflowY =
          document.body.style
            .overflowY ||
          "";

        document.body.style
          .overflowY =
          "hidden";
      };

      const unlockPage = () => {
        const previous =
          document.body.dataset
            .previousOverflowY ||
          "auto";

        document.body.style
          .overflowY =
          previous;

        delete document.body.dataset
          .previousOverflowY;
      };

      const showScene = (scene) => {
        if (!scene) return;

        scene.hidden =
          false;

        scene.setAttribute(
          "aria-hidden",
          "false"
        );

        requestAnimationFrame(
          () => {
            scene.classList.add(
              "is-visible"
            );
          }
        );
      };

      const hideScene =
        (scene, callback) => {
          if (!scene) return;

          scene.classList.remove(
            "is-visible"
          );

          scene.setAttribute(
            "aria-hidden",
            "true"
          );

          window.setTimeout(
            () => {
              scene.hidden =
                true;

              if (
                typeof callback ===
                "function"
              ) {
                callback();
              }
            },
            450
          );
        };

      const openChapterIntro =
        (chapter) => {
          selectedChapter =
            chapter;

          if (introTitle) {
            introTitle.textContent =
              chapter.title;
          }

          if (introMessage) {
            introMessage.textContent =
              chapter.intro;
          }

          lockPage();

          showScene(
            introScreen
          );
        };

      const fillChapterContent =
        (chapter) => {
          const unlockDate =
            parseLocalDate(
              chapter.unlockDate
            );

          if (contentTitle) {
            contentTitle.textContent =
              chapter.title;
          }

          if (contentDate) {
            contentDate.textContent =
              formatDate(
                unlockDate
              );
          }

          if (contentBody) {
            contentBody.innerHTML =
              chapter.content;
          }
        };

      const openChapterDirect =
        (chapter) => {
          selectedChapter =
            chapter;

          fillChapterContent(
            chapter
          );

          lockPage();

          showScene(
            contentScreen
          );
        };

      const showChapterContent =
        () => {
          if (!selectedChapter) return;

          fillChapterContent(
            selectedChapter
          );

          hideScene(
            introScreen,
            () => {
              showScene(
                contentScreen
              );
            }
          );
        };

      const closeAllChapterScenes =
        () => {
          const finish = () => {
            selectedChapter =
              null;

            unlockPage();
          };

          if (
            contentScreen &&
            !contentScreen.hidden
          ) {
            hideScene(
              contentScreen,
              finish
            );

            return;
          }

          if (
            introScreen &&
            !introScreen.hidden
          ) {
            hideScene(
              introScreen,
              finish
            );

            return;
          }

          finish();
        };

      const renderChapters = () => {
        chaptersGrid.innerHTML =
          "";

        CHAPTERS.forEach(
          (chapter) => {
            const unlocked =
              isUnlocked(
                chapter
              );

            const unlockDate =
              parseLocalDate(
                chapter.unlockDate
              );

            const card =
              document.createElement(
                "article"
              );

            card.className =
              `locked-card chapter-card ${
                unlocked
                  ? "is-unlocked"
                  : "is-locked"
              }`;

            card.dataset.chapterId =
              chapter.id;

            if (unlocked) {
              if (
                chapter.id ===
                "mes-2"
              ) {
                card.dataset.clickable =
                  "true";

                card.tabIndex = 0;

                card.setAttribute(
                  "role",
                  "button"
                );

                card.setAttribute(
                  "aria-label",
                  "Abrir carta del segundo mes"
                );

                card.innerHTML = `
                  <span class="chapter-icon">
                    ✦
                  </span>

                  <span class="chapter-title">
                    ${chapter.title}
                  </span>

                  <small class="chapter-date">
                    Toca para abrir ♡
                  </small>
                `;

                const openSecondMonth =
                  () => {
                    openChapterDirect(
                      chapter
                    );
                  };

                card.addEventListener(
                  "click",
                  openSecondMonth
                );

                card.addEventListener(
                  "keydown",
                  (event) => {
                    if (
                      event.key ===
                        "Enter" ||
                      event.key ===
                        " "
                    ) {
                      event.preventDefault();

                      openSecondMonth();
                    }
                  }
                );

              } else {
                card.innerHTML = `
                  <span class="chapter-icon">
                    ✦
                  </span>

                  <span class="chapter-title">
                    ${chapter.title}
                  </span>

                  <small class="chapter-date">
                    Desbloqueado
                  </small>

                  <button
                    class="chapter-open-btn"
                    type="button"
                    data-open-chapter="${chapter.id}"
                  >
                    Abrir capítulo
                  </button>
                `;

                const openBtn =
                  card.querySelector(
                    ".chapter-open-btn"
                  );

                if (openBtn) {
                  openBtn.addEventListener(
                    "click",
                    () => {
                      openChapterIntro(
                        chapter
                      );
                    }
                  );
                }
              }

            } else {
              card.dataset.clickable =
                "true";

              card.tabIndex = 0;

              card.setAttribute(
                "role",
                "button"
              );

              card.setAttribute(
                "aria-label",
                `${chapter.title}. Se desbloquea el ${formatDate(
                  unlockDate
                )}`
              );

              card.innerHTML = `
                <span class="chapter-icon">
                  🔒
                </span>

                <span class="chapter-title">
                  ${chapter.title}
                </span>

                <small class="chapter-date">
                  Próximamente...
                </small>
              `;

              const activateLockedCard =
                () => {
                  showLockedMessage(
                    chapter,
                    card
                  );
                };

              card.addEventListener(
                "click",
                activateLockedCard
              );

              card.addEventListener(
                "keydown",
                (event) => {
                  if (
                    event.key ===
                      "Enter" ||
                    event.key ===
                      " "
                  ) {
                    event.preventDefault();

                    activateLockedCard();
                  }
                }
              );
            }

            chaptersGrid.appendChild(
              card
            );
          }
        );
      };

      renderChapters();

      if (chapterContinueBtn) {
        chapterContinueBtn.addEventListener(
          "click",
          showChapterContent
        );
      }

      if (introCloseBtn) {
        introCloseBtn.addEventListener(
          "click",
          closeAllChapterScenes
        );
      }

      if (contentCloseBtn) {
        contentCloseBtn.addEventListener(
          "click",
          closeAllChapterScenes
        );
      }

      if (chapterBackBtn) {
        chapterBackBtn.addEventListener(
          "click",
          closeAllChapterScenes
        );
      }

      [
        introScreen,
        contentScreen
      ].forEach((scene) => {
        if (!scene) return;

        scene.addEventListener(
          "click",
          (event) => {
            if (
              event.target ===
                scene ||
              event.target
                .classList
                .contains(
                  "chapter-scene-backdrop"
                )
            ) {
              closeAllChapterScenes();
            }
          }
        );
      });

      document.addEventListener(
        "keydown",
        (event) => {
          if (
            event.key !==
            "Escape"
          ) {
            return;
          }

          const introOpen =
            introScreen &&
            !introScreen.hidden;

          const contentOpen =
            contentScreen &&
            !contentScreen.hidden;

          if (
            introOpen ||
            contentOpen
          ) {
            closeAllChapterScenes();
          }
        }
      );
    },

    /* =====================================================
       HISTORIA - LÍNEA TEMPORAL INTERACTIVA
    ===================================================== */
    initTimelineStories() {
      const stories = {
        conocimos: {
          icon: "♡",

          heading:
            "Nos conocimos",

          title:
            "Un encuentro inesperado",

          date:
            "13 de diciembre de 2023",

          text: `Nuestra historia comenzó mucho antes de que nosotros mismos pudiéramos imaginarlo.

En ese momento solo era un día cualquiera, un simple encuentro dentro de un juego, sin saber que una pequeña coincidencia algún día tendría un significado tan grande.

Un mensaje en Roblox fue el primer pequeño capítulo de nuestra historia.

Quizá en ese momento no sabíamos nada del otro, ni imaginábamos todo lo que vendría después, pero ese instante fue el comienzo de un camino que, tiempo después, nos volvería a juntar.`
        },

        reencontramos: {
          icon: "✦",

          heading:
            "Volvimos a encontrarnos",

          title:
            "Cuando el universo nos volvió a juntar",

          date:
            "4 de junio de 2026",

          text: `Después de mucho tiempo, nuestras vidas volvieron a cruzarse.

Esta vez fuiste tú quien decidió dar ese primer paso y escribir.

Sin saberlo, ese mensaje llegó en el momento perfecto.

Yo no imaginaba todo lo que iba a pasar después, ni que una conversación que parecía algo sencillo terminaría convirtiéndose en algo tan importante para mí.

Gracias por haber tenido el valor de volver a acercarte.`
        },

        hablar: {
          icon: "💌",

          heading:
            "Empezamos a hablar",

          title:
            "Conversaciones que no queríamos terminar",

          date:
            "Junio de 2026",

          text: `Al principio eran solamente conversaciones.

Pero poco a poco empezamos a conocernos más: nuestras formas de pensar, nuestros gustos, nuestras historias y esas pequeñas cosas que nos hacen ser quienes somos.

Sin darme cuenta, hablar contigo comenzó a convertirse en una de mis partes favoritas del día.

Eran conversaciones que podían durar mucho tiempo y aun así sentir que faltaba más por contar.`
        },

        sentimos: {
          icon: "✨",

          heading:
            "Nos atrevimos",

          title:
            "El día que decidimos intentarlo",

          date:
            "17 de junio de 2026",

          text: `Ese día recuerdo haber tenido muchas dudas.

No era fácil decir lo que sentía. Existía ese miedo de que todo cambiara, de que al expresar mis sentimientos pudiera perder algo que ya era muy especial para mí.

Antes había vivido momentos donde decir lo que sentía terminó alejando personas importantes, y no quería que pasara lo mismo contigo.

Pero también sabía que contigo era diferente.

Me gustaba hablar contigo, compartir momentos contigo, reír contigo y sentir esa tranquilidad que encontraba cuando estábamos juntos.

Así que decidí arriesgarme.

Y ahora sé que fue una de las mejores decisiones que pude tomar.`
        },

        espacio: {
          icon: "☾",

          heading:
            "Pasamos a WhatsApp",

          title:
            "Un lugar donde seguir conociéndonos",

          date:
            "27 de junio de 2026",

          text: `Ese día pasamos a WhatsApp y empezamos a tener un espacio un poco más nuestro.

Dejamos atrás los mensajes ocasionales y comenzamos a compartir más cosas de nuestra vida.

Más conversaciones, más momentos, más historias y más razones para seguir conociéndonos.

Poco a poco dejamos de ser dos personas que hablaban y empezamos a construir algo que sentíamos especial.`
        },

        llamada: {
          icon: "📞",

          heading:
            "Nuestra primera llamada",

          title:
            "Escuchar tu voz por primera vez",

          date:
            "5 de julio de 2026",

          text: `La primera llamada fue uno de esos momentos que parecen pequeños, pero que terminan quedándose contigo.

Por primera vez dejamos solamente los mensajes y pudimos escuchar nuestras voces.

Fue extraño y bonito al mismo tiempo, porque aunque era algo nuevo, se sentía natural.

Una llamada que empezó como algo sencillo terminó siendo uno de esos momentos donde el tiempo pasa diferente.

Horas que parecían minutos.`
        },

        novios: {
          icon: "❤",

          heading:
            "Nos hicimos novios",

          title:
            "Nuestro primer capítulo",

          date:
            "23 de agosto de 2026",

          text: `Después de todos esos pequeños momentos llegó ese día.

Después de las conversaciones, las llamadas, los nervios y todo lo que fuimos construyendo poco a poco, dejamos de ser solamente una posibilidad.

Elegimos intentarlo.

Elegimos cuidarnos, conocernos más y seguir creando recuerdos juntos.

Este fue solamente nuestro primer capítulo.

Y lo más bonito es saber que nuestra historia apenas comienza.`
        }
      };

      const modal =
        document.getElementById(
          "timelineModal"
        );

      const modalHeading =
        document.getElementById(
          "timelineModalHeading"
        );

      const modalTitle =
        document.getElementById(
          "timelineModalTitle"
        );

      const modalDate =
        document.getElementById(
          "timelineModalDate"
        );

      const modalText =
        document.getElementById(
          "timelineModalText"
        );

      const modalIcon =
        document.getElementById(
          "timelineModalIcon"
        );

      const closeBtn =
        document.getElementById(
          "timelineModalClose"
        );

      const openModal = (story) => {
        if (
          !modal ||
          !story
        ) {
          return;
        }

        if (modalIcon) {
          modalIcon.textContent =
            story.icon;
        }

        if (modalHeading) {
          modalHeading.textContent =
            story.heading;
        }

        if (modalTitle) {
          modalTitle.textContent =
            story.title;
        }

        if (modalDate) {
          modalDate.textContent =
            story.date;
        }

        if (modalText) {
          modalText.innerHTML =
            "";

          story.text
            .split(/\n\s*\n/)
            .forEach(
              (paragraph) => {
                const p =
                  document.createElement(
                    "p"
                  );

                p.textContent =
                  paragraph.trim();

                modalText.appendChild(
                  p
                );
              }
            );
        }

        modal.hidden = false;

        modal.setAttribute(
          "aria-hidden",
          "false"
        );

        document.body.dataset
          .timelineOverflow =
          document.body.style
            .overflowY ||
          "";

        document.body.style
          .overflowY =
          "hidden";

        requestAnimationFrame(
          () => {
            modal.classList.add(
              "is-open"
            );
          }
        );
      };

      const closeModal = () => {
        if (!modal) return;

        modal.classList.remove(
          "is-open"
        );

        modal.setAttribute(
          "aria-hidden",
          "true"
        );

        window.setTimeout(
          () => {
            modal.hidden = true;

            document.body.style
              .overflowY =
              document.body.dataset
                .timelineOverflow ||
              "auto";

            delete document.body.dataset
              .timelineOverflow;
          },
          350
        );
      };

      document
        .querySelectorAll(
          ".timeline-button"
        )
        .forEach(
          (button) => {
            button.addEventListener(
              "click",
              () => {
                const story =
                  stories[
                    button.dataset
                      .timeline
                  ];

                openModal(
                  story
                );
              }
            );
          }
        );

      if (closeBtn) {
        closeBtn.addEventListener(
          "click",
          closeModal
        );
      }

      if (modal) {
        modal.addEventListener(
          "click",
          (event) => {
            if (
              event.target
                .classList
                .contains(
                  "timeline-modal-backdrop"
                )
            ) {
              closeModal();
            }
          }
        );
      }

      document.addEventListener(
        "keydown",
        (event) => {
          if (
            event.key ===
              "Escape" &&
            modal &&
            !modal.hidden
          ) {
            closeModal();
          }
        }
      );
    },

    /* =====================================================
       BOTONES PENDIENTES
    ===================================================== */
    initPendingControls() {
      const tabButtons =
        document.querySelectorAll(
          ".tab-buttons button"
        );

      const memoriesButton =
        document.querySelector(
          ".outline-btn"
        );

      tabButtons.forEach(
        (button) => {
          button.disabled =
            true;

          button.title =
            "Esta sección se activará cuando agreguemos su contenido.";
        }
      );

      if (memoriesButton) {
        memoriesButton.disabled =
          true;

        memoriesButton.title =
          "Activaremos esta galería cuando agreguemos los recuerdos.";
      }
    },

    /* =====================================================
       MÓDULOS FUTUROS
    ===================================================== */
    initFutureModules() {
      this.modules = {
        timeline: {
          init() {}
        },

        chapterTabs: {
          init() {}
        },

        miniCards: {
          init() {}
        },

        memories: {
          init() {}
        },

        playlist: {
          init() {}
        },

        goals: {
          init() {}
        },

        letters: {
          init() {}
        },

        lockedChapters: {
          init() {}
        }
      };
    }
  };

  app.init();
});
