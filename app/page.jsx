"use client";

import Lanyard from "../components/Lanyard";

export default function Home() {
  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="/">mynk<span>.</span></a>
        <span className="status"><i /> INTERACTIVE 3D</span>
      </header>
      <section className="hero">
        <div className="copy">
          <p className="eyebrow">A LITTLE SOMETHING DIFFERENT</p>
          <h1>Carry your<br /><span>identity.</span></h1>
          <p className="description">A 3D lanyard with a physical-style card. Drag to swing it, tap to flip it. Your image can be added to the card face.</p>
          <div className="hint"><span>↔</span> DRAG TO ROTATE <b>·</b> TAP TO FLIP</div>
        </div>
        <div className="stage">
          <Lanyard
            frontImage="/id-front.png"
            backImage="/id-back.png"
            cardColor="#f6f5f0"
            strapColor="#173d30"
            metal="silver"
            finish="glossy"
            size={0.6}
            strapLength={0.5}
            interactive
            intro
            style={{ width: "100%", height: "100%" }}
          />
          <div className="stage-label">FIG. 001 <span>PERSONAL ID</span></div>
        </div>
      </section>
      <footer><span>BUILT FOR THE WEB</span><span>© 2026 MYNKK</span></footer>
    </main>
  );
}
