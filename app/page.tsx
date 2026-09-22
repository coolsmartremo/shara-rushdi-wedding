"use client";

import { useEffect, useRef, useState } from "react";

const WEDDING_DATE = new Date("2026-10-25T16:00:00+05:30"); // TODO: confirm the exact wedding time

function getTimeLeft() {
  const diff = Math.max(0, WEDDING_DATE.getTime() - Date.now());

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds };
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

// Fixed (non-random) petal setup so the server & client render the same thing
const PETALS = [
  { left: "3%", size: 11, duration: 13, delay: 0, variant: "gold" },
  { left: "10%", size: 8, duration: 16, delay: 3, variant: "rose" },
  { left: "18%", size: 13, duration: 11, delay: 6, variant: "ivory" },
  { left: "26%", size: 9, duration: 15, delay: 1.5, variant: "gold" },
  { left: "34%", size: 12, duration: 12.5, delay: 8, variant: "rose" },
  { left: "43%", size: 8, duration: 17, delay: 4.5, variant: "ivory" },
  { left: "52%", size: 10, duration: 14, delay: 2, variant: "gold" },
  { left: "60%", size: 13, duration: 12, delay: 9, variant: "rose" },
  { left: "68%", size: 9, duration: 16.5, delay: 5, variant: "ivory" },
  { left: "76%", size: 11, duration: 13.5, delay: 0.8, variant: "gold" },
  { left: "84%", size: 8, duration: 15.5, delay: 7, variant: "rose" },
  { left: "91%", size: 12, duration: 11.5, delay: 3.8, variant: "ivory" },
  { left: "97%", size: 9, duration: 14.5, delay: 6.5, variant: "gold" },
];

// Fixed (non-random) twinkling stars scattered around the couple's names
const NAME_STARS = [
  { top: "2%", left: "6%", size: 11, duration: 2.2, delay: 0 },
  { top: "10%", left: "90%", size: 8, duration: 2.6, delay: 0.7 },
  { top: "38%", left: "2%", size: 9, duration: 2.4, delay: 1.4 },
  { top: "42%", left: "94%", size: 12, duration: 2.8, delay: 0.3 },
  { top: "72%", left: "8%", size: 8, duration: 2.3, delay: 1.9 },
  { top: "76%", left: "88%", size: 10, duration: 2.5, delay: 1.1 },
  { top: "95%", left: "45%", size: 9, duration: 2.7, delay: 0.5 },
];

export default function Home() {
  const [opened, setOpened] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // RSVP form
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpGuests, setRsvpGuests] = useState("");
  const [rsvpAttending, setRsvpAttending] = useState<"yes" | "no" | "">("");
  const [rsvpMessage, setRsvpMessage] = useState("");

  useEffect(() => {
    setTimeLeft(getTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Reveal sections (and their gold divider lines) as they scroll into view
  useEffect(() => {
    if (!opened) return;

    const targets = document.querySelectorAll(".reveal, .reveal-line");
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [opened]);

  const startMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio
      .play()
      .then(() => setMusicOn(true))
      .catch(() => setMusicOn(false)); // browser blocked autoplay, that's fine
  };

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (musicOn) {
      audio.pause();
      setMusicOn(false);
    } else {
      startMusic();
    }
  };

  const handleOpen = () => {
    if (transitioning) return;

    setTransitioning(true);
    startMusic(); // this click counts as a "user gesture" so autoplay is allowed

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // let the opening screen fade out smoothly before swapping content
    window.setTimeout(
      () => setOpened(true),
      prefersReducedMotion ? 0 : 650
    );
  };

  // RSVP: WhatsApp number to send responses to
  const RSVP_WHATSAPP_NUMBER = "94756001697";

  const rsvpReady = rsvpName.trim() !== "" && rsvpAttending !== "";

  function buildRsvpMessage() {
    const attendingText =
      rsvpAttending === "yes"
        ? "Yes, I'll be there"
        : rsvpAttending === "no"
        ? "Sorry, I won't be able to come"
        : "-";

    const lines = [
      "Wedding RSVP - Shara & Rushdi",
      `Name: ${rsvpName.trim()}`,
      `Number of Guests: ${rsvpGuests || "-"}`,
      `Attending: ${attendingText}`,
    ];

    if (rsvpMessage.trim()) {
      lines.push(`Message: ${rsvpMessage.trim()}`);
    }

    return lines.join("\n");
  }

  function handleWhatsappRsvp() {
    if (!rsvpReady) return;

    const text = encodeURIComponent(buildRsvpMessage());
    window.open(
      `https://wa.me/${RSVP_WHATSAPP_NUMBER}?text=${text}`,
      "_blank"
    );
  }

  return (
    <main className="wedding-page">
      {/* FALLING PETALS (decorative, sits over the whole page) */}
      <div className="petals" aria-hidden="true">
        {PETALS.map((p, i) => (
          <span
            key={i}
            className={`petal petal--${p.variant}`}
            style={{
              left: p.left,
              width: p.size,
              height: p.size * 1.3,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* BACKGROUND MUSIC */}
      <audio ref={audioRef} src="/wedding-music.mp3" loop preload="none" />

      <button
        type="button"
        className={`music-toggle ${musicOn ? "is-on" : "is-off"}`}
        onClick={toggleMusic}
        aria-pressed={musicOn}
        aria-label={musicOn ? "Turn music off" : "Turn music on"}
      >
        <span className="music-toggle-disc">♪</span>
        <span className="music-toggle-label">{musicOn ? "ON" : "OFF"}</span>
      </button>

      {/* =====================================================
          OPENING SCREEN
      ====================================================== */}
      {!opened && (
        <section
          className={`opening-screen ${transitioning ? "is-closing" : ""}`}
        >
          {/* COUPLE PHOTO BACKGROUND */}
          <img src="/opening-photo.jpg" alt="" className="opening-background" />

          {/* SOFT IVORY OVERLAY */}
          <div className="opening-overlay"></div>

          {/* TOP DECORATION */}
          <div className="opening-decoration top-decoration">✦</div>

          {/* CONTENT */}
          <div className="opening-content">
            {/* ARABIC */}
            <div className="arabic-greeting">فِي الدُّنْيَا وَالْآخِرَةِ</div>

            {/* BLESSING */}
            <div className="blessing-text">WITH THE BLESSINGS OF ALLAH</div>

            {/* ORNAMENT */}
            <div className="ornament">◇</div>

            {/* COUPLE NAMES */}
            <div className="name-stars-wrap">
              <h1 className="opening-names">
                Shara
                <span>&</span>
                Rushdi
              </h1>

              <div className="name-stars" aria-hidden="true">
                {NAME_STARS.map((s, i) => (
                  <span
                    key={i}
                    className="name-star"
                    style={{
                      top: s.top,
                      left: s.left,
                      fontSize: s.size,
                      animationDuration: `${s.duration}s`,
                      animationDelay: `${s.delay}s`,
                    }}
                  >
                    ✦
                  </span>
                ))}
              </div>
            </div>

            {/* GOLD DIVIDER */}
            <div className="gold-line">
              <span></span>
              <i>✦</i>
              <span></span>
            </div>

            {/* INVITATION */}
            <p className="opening-description">
              Together with their families
              <br />
              cordially invite you to celebrate their
            </p>

            {/* EVENT */}
            <h2 className="opening-event">WEDDING</h2>

            {/* OPEN BUTTON */}
            <button className="open-button" onClick={handleOpen}>
              <span>♡</span>
              TAP TO OPEN
            </button>
          </div>

          {/* BOTTOM DECORATION */}
          <div className="opening-decoration bottom-decoration">✦</div>
        </section>
      )}

      {/* =====================================================
          MAIN INVITATION
      ====================================================== */}
      {opened && (
        <div className="invitation-container">
          {/* =================================================
              HEADER
          ================================================== */}
          <section className="header-section">
            <img src="/header-photo.jpg" alt="" className="header-photo" />

            <div className="header-overlay"></div>

            <div className="arabic-greeting">فِي الدُّنْيَا وَالْآخِرَةِ</div>

            <div className="blessing-text">WITH THE BLESSINGS OF ALLAH</div>

            <div className="ornament">◇</div>

            <div className="name-stars-wrap">
              <h1 className="couple-names">
                Shara
                <span>&</span>
                Rushdi
              </h1>

              <div className="name-stars" aria-hidden="true">
                {NAME_STARS.map((s, i) => (
                  <span
                    key={i}
                    className="name-star"
                    style={{
                      top: s.top,
                      left: s.left,
                      fontSize: s.size,
                      animationDuration: `${s.duration}s`,
                      animationDelay: `${s.delay}s`,
                    }}
                  >
                    ✦
                  </span>
                ))}
              </div>
            </div>

            <div className="gold-line">
              <span></span>
              <i>✦</i>
              <span></span>
            </div>

            <p className="invite-text">
              Together with their families
              <br />
              cordially invite you to celebrate their
            </p>

            <h2 className="wedding-title">WEDDING</h2>
          </section>

          {/* =================================================
              FAMILY SECTION
          ================================================== */}
          <section className="family-section reveal">
            <div className="section-heading reveal-line">
              <span></span>
              <h3>WITH THEIR FAMILIES</h3>
              <span></span>
            </div>

            <div className="family-grid">
              {/* BRIDE'S FAMILY */}
              <div className="family-card">
                <div className="family-icon">♡</div>

                <div className="family-label">BRIDE'S FAMILY</div>

                <div className="family-divider">✦</div>

                <div className="parents">
                  <p className="parent-title">Mr. T.M.I.R Sahama</p>

                  <p className="parent-title">Mrs. Fawzil Hidaya</p>
                </div>
              </div>

              {/* GROOM'S FAMILY */}
              <div className="family-card">
                <div className="family-icon">♡</div>

                <div className="family-label">GROOM'S FAMILY</div>

                <div className="family-divider">✦</div>

                <div className="parents">
                  <p className="parent-title">Mr. T.M.H Kitchilan</p>

                  <p className="parent-title">Mrs. M.S. Kitchilan</p>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              WEDDING DRESS CODE SECTION
          ================================================== */}
          <section className="dress-code-section reveal">
            <div className="dress-code-card">
              <div className="section-heading reveal-line">
                <span></span>
                <h3>WEDDING DRESS CODE</h3>
                <span></span>
              </div>

              <p className="dress-code-text">
                We know many like to come dressed to compliment the big day.
                Provided below is the color palette of our day. We look
                forward to seeing you all!
              </p>

              <img
                src="/dress-code-palette.png"
                alt="Wedding dress code colour palette: ivory, taupe, champagne, gold and yellow gold"
                className="dress-code-image"
              />
            </div>
          </section>

          {/* =================================================
              COUNTDOWN SECTION
          ================================================== */}
          <section className="countdown-section reveal">
            <div className="countdown-date">
              <span className="countdown-date-label">Wedding Date</span>
              <span className="countdown-date-value">
                25th of October 2026
              </span>

              <span className="countdown-date-label countdown-time-label">
                Time
              </span>
              <span className="countdown-date-value countdown-time-value">
                After Luhar Salah
              </span>
            </div>

            <div className="section-heading reveal-line">
              <span></span>
              <h3>COUNTING DOWN TO OUR WEDDING</h3>
              <span></span>
            </div>

            <div className="countdown-grid">
              <div className="countdown-card">
                <div className="countdown-number-frame">
                  <span key={`d-${timeLeft.days}`} className="countdown-number">
                    {pad(timeLeft.days)}
                  </span>
                </div>
                <div className="countdown-label">Day</div>
              </div>

              <div className="countdown-sep">✦</div>

              <div className="countdown-card">
                <div className="countdown-number-frame">
                  <span key={`h-${timeLeft.hours}`} className="countdown-number">
                    {pad(timeLeft.hours)}
                  </span>
                </div>
                <div className="countdown-label">Hour</div>
              </div>

              <div className="countdown-sep">✦</div>

              <div className="countdown-card">
                <div className="countdown-number-frame">
                  <span
                    key={`m-${timeLeft.minutes}`}
                    className="countdown-number"
                  >
                    {pad(timeLeft.minutes)}
                  </span>
                </div>
                <div className="countdown-label">Min</div>
              </div>

              <div className="countdown-sep">✦</div>

              <div className="countdown-card">
                <div className="countdown-number-frame">
                  <span
                    key={`s-${timeLeft.seconds}`}
                    className="countdown-number"
                  >
                    {pad(timeLeft.seconds)}
                  </span>
                </div>
                <div className="countdown-label">Sec</div>
              </div>
            </div>
          </section>

          {/* =================================================
              HOTEL / VENUE SECTION
          ================================================== */}
          <section className="venue-section reveal">
            <div className="venue-card">
              {/* TOP ORNAMENT */}
              <div className="venue-top-decoration">✦</div>

              {/* TITLE */}
              <div className="section-heading venue-heading reveal-line">
                <span></span>
                <h3>OUR VENUE</h3>
                <span></span>
              </div>

              {/* HOTEL ICON */}
              <div className="venue-icon">🏨</div>

              <div className="venue-small-title">CELEBRATING AT</div>

              <h2 className="venue-name">JADE GREEN</h2>

              <div className="venue-location">HAMBANTOTA</div>

              {/* DIVIDER */}
              <div className="venue-divider reveal-line">
                <span></span>
                <i>✦</i>
                <span></span>
              </div>

              {/* DESCRIPTION */}
              <p className="venue-description">
                We are delighted to celebrate this
                <br />
                beautiful occasion at
                <br />
                Jade Green, Hambantota.
              </p>

              {/* HOTEL BUTTONS */}
              <div className="venue-buttons">
                <a
                  href="https://www.jadegreen.lk/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="venue-button"
                >
                  HOTEL WEBSITE
                </a>

                <a
                  href="https://www.google.com/maps/search/?api=1&query=Jade+Green+Hambantota"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="venue-button outline"
                >
                  GET DIRECTIONS
                </a>
              </div>

              {/* HOTEL PHOTOS */}
              <div className="hotel-gallery">
                <div className="hotel-photo">
                  <img src="/hotel-1.jpeg" alt="Jade Green Hambantota" />
                </div>

                <div className="hotel-photo">
                  <img
                    src="/hotel-2.jpeg"
                    alt="Jade Green Hambantota Swimming Pool"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              RSVP SECTION
          ================================================== */}
          <section className="rsvp-section reveal">
            <div className="rsvp-card">
              <div className="rsvp-ornament">✦</div>

              <div className="rsvp-title">
                ~ WE WOULD LOVE TO HEAR FROM YOU ~
              </div>

              <p className="rsvp-text">
                Kindly let us know if you will be joining us
                <br className="desktop-break" />
                for our special day.
              </p>

              <form
                className="rsvp-form"
                onSubmit={(e) => e.preventDefault()}
              >
                <label className="rsvp-field">
                  <span className="rsvp-label">Your Name</span>
                  <input
                    type="text"
                    className="rsvp-input"
                    placeholder="Enter your name"
                    value={rsvpName}
                    onChange={(e) => setRsvpName(e.target.value)}
                  />
                </label>

                <label className="rsvp-field">
                  <span className="rsvp-label">Number of Guests</span>
                  <select
                    className="rsvp-input rsvp-select"
                    value={rsvpGuests}
                    onChange={(e) => setRsvpGuests(e.target.value)}
                  >
                    <option value="">Select number of guests</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                    <option value="10+">10+</option>
                  </select>
                </label>

                <div className="rsvp-field">
                  <span className="rsvp-label">Will You Be Joining Us?</span>
                  <div className="rsvp-attend-buttons">
                    <button
                      type="button"
                      className={`rsvp-attend-button ${
                        rsvpAttending === "yes" ? "is-active" : ""
                      }`}
                      onClick={() => setRsvpAttending("yes")}
                    >
                      {"♥ Yes, I'll be there"}
                    </button>

                    <button
                      type="button"
                      className={`rsvp-attend-button ${
                        rsvpAttending === "no" ? "is-active" : ""
                      }`}
                      onClick={() => setRsvpAttending("no")}
                    >
                      {"✦ Sorry, I won't be able to come"}
                    </button>
                  </div>
                </div>

                <label className="rsvp-field">
                  <span className="rsvp-label">Message / Comment</span>
                  <textarea
                    className="rsvp-input rsvp-textarea"
                    placeholder="Leave us a little message..."
                    rows={4}
                    value={rsvpMessage}
                    onChange={(e) => setRsvpMessage(e.target.value)}
                  />
                </label>
              </form>

              <div className="rsvp-buttons">
                <button
                  type="button"
                  className="rsvp-button whatsapp"
                  onClick={handleWhatsappRsvp}
                  disabled={!rsvpReady}
                >
                  <span>♡</span>
                  WHATSAPP
                </button>

                <a href="tel:+94710611010" className="rsvp-button call">
                  <span>☎</span>
                  CALL
                </a>
              </div>

              {!rsvpReady && (
                <p className="rsvp-hint">
                  Please enter your name and let us know if you&apos;ll be
                  joining, to enable sending.
                </p>
              )}

              <p className="rsvp-note">
                Your response will be sent directly to us.
              </p>
            </div>
          </section>

          {/* =================================================
              CLOSING
          ================================================== */}
          <section className="closing-section reveal">
            <div className="closing-ornament">✦</div>

            <h2>A BEAUTIFUL BEGINNING</h2>

            <div className="closing-line reveal-line">
              <span></span>
              <i>♡</i>
              <span></span>
            </div>

            <p>FOR A BLESSED JOURNEY</p>

            <div className="closing-dua">
              <div className="closing-dua-arabic" dir="rtl">
                بَارَكَ اللهُ لَكُماَ وَبَارَكَ عَلَيْكُماَ وَجَمَعَ بَيْنَكُمَا
                فِي خَيْرٍ
              </div>

              <div className="closing-dua-translation">
                &ldquo;May Allah bless you both, shower His blessings upon
                you, and unite you both in goodness.&rdquo;
              </div>
            </div>

            <div className="closing-ornament">✦</div>
          </section>

          {/* =================================================
              CREDIT FOOTER
          ================================================== */}
          <footer className="credit-footer reveal">
            <p className="credit-text">
              Coded by <span className="credit-name">Tuan Hijaz</span>
            </p>
            <p className="credit-phone">071 239 64 64</p>
          </footer>
        </div>
      )}
    </main>
  );
}
