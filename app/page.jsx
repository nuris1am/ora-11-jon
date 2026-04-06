"use client";

import { useEffect } from "react";

const pageMarkup = `
<a class="skip-link" href="#home">মূল কনটেন্টে যান</a>

<nav class="navbar" id="navbar">
  <a href="#home" class="nav-logo">
    <div class="nav-logo-icon">ও</div>
    <div class="nav-logo-text">
      ওরা এগারো জন সমিতি
      <span>সমবায় সমিতি</span>
    </div>
  </a>

  <ul class="nav-links">
    <li><a href="#home">হোম</a></li>
    <li><a href="#about">আমাদের সম্পর্কে</a></li>
    <li><a href="#events">ইভেন্ট</a></li>
    <li><a href="#services">সেবা</a></li>
    <li><a href="#members">সদস্য</a></li>
    <li><a href="#contact">যোগাযোগ</a></li>
  </ul>

  <div class="nav-actions">
    <button class="btn-nav btn-nav-outline">লগইন</button>
    <button class="btn-nav btn-nav-gold">যোগ দিন</button>
  </div>

  <div class="hamburger" id="hamburger" onclick="toggleMobile()" aria-label="মোবাইল মেনু" role="button" tabindex="0">
    <span></span><span></span><span></span>
  </div>
</nav>

<div class="mobile-nav" id="mobileNav">
  <a href="#home" onclick="toggleMobile()">🏠 হোম</a>
  <a href="#about" onclick="toggleMobile()">ℹ️ আমাদের সম্পর্কে</a>
  <a href="#events" onclick="toggleMobile()">📅 ইভেন্ট</a>
  <a href="#services" onclick="toggleMobile()">🌿 সেবা</a>
  <a href="#members" onclick="toggleMobile()">👥 সদস্য</a>
  <a href="#contact" onclick="toggleMobile()">📞 যোগাযোগ</a>
</div>

<section class="hero" id="home">
  <div class="hero-orb hero-orb-1"></div>
  <div class="hero-orb hero-orb-2"></div>

  <div class="hero-inner">
    <div class="hero-content">
      <div class="hero-badge">🌿 সমবায় সমিতি — ২০২১ সাল থেকে</div>
      <h1 class="hero-title">
        ওরা এগারো<br>
        <span class="gold">জন সমিতি</span>
      </h1>
      <p class="hero-desc">
        একটি অলাভজনক প্রতিষ্ঠান যা স্থানীয় সম্প্রদায়ের উন্নয়ন এবং সামাজিক সেবার উদ্দেশ্যে কাজ করে।
        সদস্যদের মধ্যে সহযোগিতা, সংহতি এবং সামাজিক দায়িত্ববোধ বৃদ্ধি করাই আমাদের লক্ষ্য।
      </p>

      <div class="hero-stats">
        <div class="stat">
          <div class="stat-num">১১+</div>
          <div class="stat-label">সক্রিয় সদস্য</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat">
          <div class="stat-num">০৫+</div>
          <div class="stat-label">বছরের অভিজ্ঞতা</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat">
          <div class="stat-num">১০+</div>
          <div class="stat-label">প্রকল্প সম্পন্ন</div>
        </div>
      </div>

      <div class="hero-btns">
        <a href="#about" class="btn-primary-hero">আমাদের জানুন →</a>
        <a href="#contact" class="btn-secondary-hero">📞 যোগাযোগ করুন</a>
      </div>
    </div>

    <div class="hero-visual">
      <div class="carousel-wrap" id="heroCarousel">
        <img src="/gallery/image (23).jpg" class="active" alt="বাৎসরিক সভা">
        <img src="/gallery/image (1).jpg" alt="কমিউনিটি কার্যক্রম">
        <img src="/gallery/image (4).jpg" alt="সমিতির ইভেন্ট">
        <div class="carousel-overlay">
          <div class="carousel-caption-text" id="heroCaption">বাৎসরিক মিটিং ২০২৪</div>
          <div class="carousel-dots">
            <div class="dot active" onclick="goToSlide(0)"></div>
            <div class="dot" onclick="goToSlide(1)"></div>
            <div class="dot" onclick="goToSlide(2)"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="about-section" id="about">
  <div class="about-inner">
    <div class="about-text">
      <div class="section-label">আমাদের সম্পর্কে</div>
      <h2 class="section-title">আমরা কারা এবং কী করি ?</h2>
      <p class="section-sub">
        ওরা এগারো জন সমিতি ২০২১ সাল থেকে স্থানীয় জনগণের জন্য কাজ করে আসছে। আমরা বিশ্বাস করি একতাবদ্ধ হলে যেকোনো সমস্যার সমাধান সম্ভব।
      </p>

      <div class="about-features">
        <div class="feature-card reveal"><div class="feature-icon">🤝</div><div class="feature-title">সহযোগিতা</div><div class="feature-desc">সকল সদস্যের সম্মিলিত প্রচেষ্টায় এগিয়ে যাওয়া আমাদের শক্তি।</div></div>
        <div class="feature-card reveal"><div class="feature-icon">🌱</div><div class="feature-title">টেকসই উন্নয়ন</div><div class="feature-desc">ভবিষ্যৎ প্রজন্মের কথা মাথায় রেখে পরিকল্পনা গ্রহণ করি।</div></div>
        <div class="feature-card reveal"><div class="feature-icon">📚</div><div class="feature-title">শিক্ষা</div><div class="feature-desc">জ্ঞান ও দক্ষতা বৃদ্ধির মাধ্যমে সমাজকে এগিয়ে নেওয়া।</div></div>
        <div class="feature-card reveal"><div class="feature-icon">❤️</div><div class="feature-title">সামাজিক দায়বদ্ধতা</div><div class="feature-desc">সমাজের প্রতি দায়িত্ব পালনে সর্বদা সচেষ্ট।</div></div>
      </div>
    </div>

    <div class="about-image-grid">
      <div class="about-img"><img src="/gallery/image (22).jpg" alt="সম্প্রদায়ভিত্তিক কার্যক্রম"></div>
      <div class="about-img"><img src="/gallery/image (3).jpg" alt="কৃষি উন্নয়ন"></div>
      <div class="about-img"><img src="/gallery/image (5).jpg" alt="শিক্ষা"></div>
    </div>
  </div>
</section>

<section class="events-section" id="events">
  <div class="events-inner">
    <div class="section-header reveal">
      <div class="section-label">আমাদের ইভেন্ট</div>
      <h2 class="section-title">বাৎসরিক <span class="accent">মিটিং ও কার্যক্রম</span></h2>
      <p class="section-sub">প্রতি বছর আমরা বিভিন্ন গুরুত্বপূর্ণ সভা, আলোচনা ও সামাজিক কার্যক্রম পরিচালনা করি।</p>
    </div>

    <div class="events-grid">
      <div class="event-card reveal">
        <div class="event-img"><img src="/gallery/image (1).jpg" alt="সভা ২০২২"><span class="event-tag">সম্পন্ন</span></div>
        <div class="event-body"><div class="event-date">📅 ডিসেম্বর ২০২২</div><div class="event-title">বাৎসরিক সাধারণ সভা ২০২২</div><p class="event-desc">২০২২ সালের বার্ষিক সাধারণ সভায় সদস্যরা একত্রিত হয়ে সংগঠনের ভবিষ্যৎ পরিকল্পনা নিয়ে আলোচনা করেন।</p></div>
        <div class="event-footer"><a href="#contact">বিস্তারিত দেখুন →</a></div>
      </div>
      <div class="event-card reveal">
        <div class="event-img"><img src="/gallery/image (22).jpg" alt="সভা ২০২৩"><span class="event-tag">সম্পন্ন</span></div>
        <div class="event-body"><div class="event-date">📅 ডিসেম্বর ২০২৩</div><div class="event-title">বাৎসরিক সাধারণ সভা ২০২৩</div><p class="event-desc">২০২৩ সালের সভায় নতুন প্রকল্পের অনুমোদন এবং আগামী বছরের বাজেট পরিকল্পনা গৃহীত হয়।</p></div>
        <div class="event-footer"><a href="#contact">বিস্তারিত দেখুন →</a></div>
      </div>
      <div class="event-card reveal">
        <div class="event-img"><img src="/gallery/image (2).jpg" alt="সভা ২০২৪"><span class="event-tag" style="background:var(--gold);">সাম্প্রতিক</span></div>
        <div class="event-body"><div class="event-date">📅 ডিসেম্বর ২০২৪</div><div class="event-title">বাৎসরিক সাধারণ সভা ২০২৪</div><p class="event-desc">সর্বশেষ সভায় ২০২৫ সালের কার্যকরী পরিকল্পনা নির্ধারণ এবং নতুন কমিটি গঠন করা হয়।</p></div>
        <div class="event-footer"><a href="#contact">বিস্তারিত দেখুন →</a></div>
      </div>
    </div>
  </div>
</section>

<section class="services-section" id="services">
  <div class="services-inner">
    <div class="section-header reveal" style="text-align:center; margin: 0 auto 52px;">
      <div class="section-label">আমাদের কার্যক্রম</div>
      <h2 class="section-title">আমাদের <span class="accent">সেবাসমূহ</span></h2>
      <p class="section-sub" style="margin: 0 auto;">ওরা এগারো জন সমিতি স্থানীয় জনগণের জীবনমান উন্নয়নে বিভিন্ন কার্যক্রম পরিচালনা করে।</p>
    </div>

    <div class="services-grid">
      <div class="service-card reveal"><div class="service-img"><img src="/gallery/image (3).jpg" alt="কৃষি উন্নয়ন"></div><div class="service-body"><div class="service-num">০১</div><h3 class="service-title">কৃষি উন্নয়ন</h3><p class="service-desc">কৃষকদের জন্য আধুনিক কৃষি পদ্ধতির প্রশিক্ষণ ও কর্মশালা আয়োজন করা হয়। উন্নত বীজ, সার ও প্রযুক্তি ব্যবহারে সহায়তা প্রদান করা হয়।</p><a href="#contact" class="service-link">আরও জানুন →</a></div></div>
      <div class="service-card reveal"><div class="service-img"><img src="/gallery/image (18).jpg" alt="স্বাস্থ্য সেবা"></div><div class="service-body"><div class="service-num">০২</div><h3 class="service-title">স্বাস্থ্য সেবা</h3><p class="service-desc">বিনামূল্যে স্বাস্থ্য ক্যাম্প আয়োজন করা হয়। স্থানীয় চিকিৎসকদের সহায়তায় পরীক্ষা-নিরীক্ষা ও ওষুধ বিতরণ করা হয়।</p><a href="#contact" class="service-link">আরও জানুন →</a></div></div>
      <div class="service-card reveal"><div class="service-img"><img src="/gallery/image (5).jpg" alt="শিক্ষা ও প্রশিক্ষণ"></div><div class="service-body"><div class="service-num">০৩</div><h3 class="service-title">শিক্ষা ও প্রশিক্ষণ</h3><p class="service-desc">দক্ষতা উন্নয়নমূলক প্রশিক্ষণ কর্মসূচি আয়োজন করা হয়। মেধাবী শিক্ষার্থীদের বৃত্তি প্রদান করা হয়।</p><a href="#contact" class="service-link">আরও জানুন →</a></div></div>
    </div>
  </div>
</section>

<section class="members-section" id="members">
  <div class="members-inner">
    <div class="section-header reveal" style="text-align:center;">
      <div class="section-label" style="background:rgba(200,151,58,0.15); border-color:rgba(200,151,58,0.4); color:var(--gold-light);">আমাদের পরিবার</div>
      <h2 class="section-title" style="color:white;">পরিষদ <span style="color:var(--gold-light);">সদস্যবৃন্দ</span></h2>
      <p class="section-sub" style="color:rgba(255,255,255,0.65); margin:0 auto;">আমাদের ১১ জন নিবেদিতপ্রাণ সদস্য যারা সমাজের কল্যাণে একসাথে কাজ করছেন।</p>
    </div>

    <div class="members-grid">
      <div class="member-card reveal"><div class="member-avatar">A</div><div class="member-name">Ayub Mahmud </div><div class="member-role">সভাপতি</div><div class="member-info">সংগঠনের প্রতিষ্ঠাতা সদস্য। ৩০ বছরের বেশি সময় ধরে সমাজসেবায় নিয়োজিত।</div></div>
      <div class="member-card reveal"><div class="member-avatar">N</div><div class="member-name">Nazmul Huda</div><div class="member-role">সহ-সভাপতি</div><div class="member-info">কৃষি উন্নয়ন বিভাগের দায়িত্বে নিয়োজিত।</div></div>
      <div class="member-card reveal"><div class="member-avatar">P</div><div class="member-name">Palash Mulla</div><div class="member-role">সাধারণ সম্পাদক</div><div class="member-info">সাংগঠনিক কার্যক্রম পরিচালনায় দক্ষ এবং অভিজ্ঞ।</div></div>
      <div class="member-card reveal"><div class="member-avatar">A</div><div class="member-name">Ashik Paul</div><div class="member-role">কোষাধ্যক্ষ</div><div class="member-info">আর্থিক ব্যবস্থাপনা ও হিসাব-নিকাশের দায়িত্বে।</div></div>
    </div>

    <div class="members-cta reveal">
      <a href="/menberlist.html" class="btn-primary-hero" style="display:inline-flex;">👥 সকল সদস্য দেখুন →</a>
    </div>
  </div>
</section>

<section class="newsletter-section">
  <div class="newsletter-inner reveal">
    <h2>আমাদের নিউজলেটারে যোগ দিন</h2>
    <p>সর্বশেষ সংবাদ, ইভেন্ট ও কার্যক্রম সম্পর্কে আপডেট পেতে সাবস্ক্রাইব করুন।</p>
    <form class="newsletter-form" id="newsletterForm">
      <input type="email" placeholder="আপনার ইমেইল ঠিকানা লিখুন..." id="nlEmail" autocomplete="email" required>
      <button type="submit">সাবস্ক্রাইব করুন ✓</button>
    </form>
    <div id="nlSuccess" style="display:none; margin-top:16px; color:var(--emerald-dark); font-weight:700;">✅ সফলভাবে সাবস্ক্রাইব হয়েছেন! ধন্যবাদ।</div>
  </div>
</section>

<section class="contact-section" id="contact">
  <div class="contact-inner">
    <div>
      <div class="section-label">যোগাযোগ করুন</div>
      <h2 class="section-title">আমাদের সাথে <span class="accent">কথা বলুন</span></h2>
      <p class="section-sub">যেকোনো প্রশ্ন বা সহায়তার জন্য আমরা সর্বদা আপনার পাশে আছি।</p>

      <div class="contact-info-cards">
        <div class="contact-info-card reveal"><div class="contact-icon">📧</div><div><div class="contact-info-label">ইমেইল</div><div class="contact-info-val">ora11jon21@gmail.com</div></div></div>
        <div class="contact-info-card reveal"><div class="contact-icon">📞</div><div><div class="contact-info-label">ফোন</div><div class="contact-info-val">01715987336</div></div></div>
        <div class="contact-info-card reveal"><div class="contact-icon">📍</div><div><div class="contact-info-label">ঠিকানা</div><div class="contact-info-val">ঢাকা, বাংলাদেশ</div></div></div>
        <div class="contact-info-card reveal"><div class="contact-icon">🕐</div><div><div class="contact-info-label">কার্যঘণ্টা</div><div class="contact-info-val">শনি–বৃহস্পতি, সকাল ৯টা – বিকাল ৫টা</div></div></div>
      </div>
    </div>

    <div class="contact-form-wrap reveal">
      <h3 class="form-title">বার্তা পাঠান</h3>
      <form id="contactForm">
        <div class="form-row">
          <div class="form-group"><label>আপনার নাম *</label><input type="text" placeholder="নাম লিখুন" id="cName" autocomplete="name" required></div>
          <div class="form-group"><label>ফোন নম্বর</label><input type="tel" placeholder="01XXXXXXXXX" id="cPhone" autocomplete="tel"></div>
        </div>
        <div class="form-group"><label>ইমেইল *</label><input type="email" placeholder="আপনার ইমেইল" id="cEmail" autocomplete="email" required></div>
        <div class="form-group"><label>বিষয়</label><select id="cSubject"><option value="">বিষয় নির্বাচন করুন</option><option>সদস্যপদ আবেদন</option><option>কৃষি উন্নয়ন</option><option>স্বাস্থ্য সেবা</option><option>শিক্ষা কার্যক্রম</option><option>সাধারণ অনুসন্ধান</option></select></div>
        <div class="form-group"><label>বার্তা *</label><textarea placeholder="আপনার বার্তা লিখুন..." id="cMsg" required></textarea></div>
        <button class="btn-submit" type="submit">বার্তা পাঠান ✉️</button>
      </form>
      <div class="form-success" id="formSuccess">✅ আপনার বার্তা সফলভাবে পাঠানো হয়েছে। শীঘ্রই আমরা যোগাযোগ করব।</div>
    </div>
  </div>
</section>

<footer>
  <div class="footer-inner">
    <div class="footer-grid">
      <div class="footer-brand">
        <div class="nav-logo"><div class="nav-logo-icon">ও</div><div class="nav-logo-text">ওরা এগারো জন সমিতি<span>সমবায় সমিতি</span></div></div>
        <p>১৯৯৫ সাল থেকে আমরা স্থানীয় জনগণের জন্য নিরলসভাবে কাজ করে আসছি। সহযোগিতা ও সংহতিই আমাদের শক্তি।</p>
        <div class="social-links">
          <a href="https://facebook.com" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="ফেসবুক">ফ</a>
          <a href="https://linkedin.com" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="লিংকডইন">ইন</a>
          <a href="https://youtube.com" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="ইউটিউব">ইউ</a>
          <a href="https://wa.me/8801700000000" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="হোয়াটসঅ্যাপ">হো</a>
        </div>
      </div>

      <div class="footer-col">
        <h4>দ্রুত লিংক</h4>
        <ul class="footer-links">
          <li><a href="#home">হোম</a></li>
          <li><a href="#about">আমাদের সম্পর্কে</a></li>
          <li><a href="#events">ইভেন্ট</a></li>
          <li><a href="#services">সেবাসমূহ</a></li>
          <li><a href="#members">সদস্যবৃন্দ</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>সেবাসমূহ</h4>
        <ul class="footer-links">
          <li><a href="#services">কৃষি উন্নয়ন</a></li>
          <li><a href="#services">স্বাস্থ্য সেবা</a></li>
          <li><a href="#services">শিক্ষা কার্যক্রম</a></li>
          <li><a href="#services">দুর্যোগ ব্যবস্থাপনা</a></li>
          <li><a href="#services">মহিলা উন্নয়ন</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>যোগাযোগ</h4>
        <ul class="footer-links">
          <li><a href="mailto:ora11jon21@gmail.com">📧 ora11jon21@gmail.com</a></li>
          <li><a href="tel:+8801715987336">📞 01715-987336</a></li>
          <li><a href="https://maps.google.com/?q=Dhaka,Bangladesh" target="_blank" rel="noopener noreferrer">📍 ঢাকা, বাংলাদেশ</a></li>
          <li><a href="#contact">🕐 শনি–বৃহস্পতি</a></li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <p>© <span id="copyrightYear">২০২৫</span> ওরা এগারো জন সমিতি। সকল অধিকার সংরক্ষিত।</p>
      <p style="color:rgba(255,255,255,0.3);">গোপনীয়তা নীতি · ব্যবহারের শর্তাবলী</p>
    </div>
  </div>
</footer>

<button class="scroll-top" id="scrollTop" onclick="window.scrollTo({top:0, behavior:'smooth'})" aria-label="উপরে যান">↑</button>
`;

export default function HomePage() {
  useEffect(() => {
    const navbar = document.getElementById("navbar");
    const scrollTop = document.getElementById("scrollTop");
    const mobileNav = document.getElementById("mobileNav");
    const hamburger = document.getElementById("hamburger");
    const heroCarousel = document.getElementById("heroCarousel");
    const contactForm = document.getElementById("contactForm");
    const newsletterForm = document.getElementById("newsletterForm");
    const copyrightYear = document.getElementById("copyrightYear");

    let currentSlide = 0;
    const captions = ["বাৎসরিক মিটিং ২০২৪", "আমাদের কমিউনিটি", "সমিতির কার্যক্রম"];
    let carouselInterval = null;

    const onScroll = () => {
      if (window.scrollY > 50) navbar?.classList.add("scrolled");
      else navbar?.classList.remove("scrolled");

      if (window.scrollY > 400) scrollTop?.classList.add("visible");
      else scrollTop?.classList.remove("visible");
    };

    const goToSlide = (n) => {
      if (!heroCarousel) return;
      const imgs = heroCarousel.querySelectorAll("img");
      const dots = document.querySelectorAll(".dot");
      if (!imgs.length || !dots.length) return;
      imgs[currentSlide]?.classList.remove("active");
      dots[currentSlide]?.classList.remove("active");
      currentSlide = n;
      imgs[currentSlide]?.classList.add("active");
      dots[currentSlide]?.classList.add("active");
      const caption = document.getElementById("heroCaption");
      if (caption) caption.textContent = captions[currentSlide];
    };

    const startCarousel = () => {
      if (carouselInterval) return;
      carouselInterval = setInterval(() => {
        goToSlide((currentSlide + 1) % 3);
      }, 4000);
    };

    const stopCarousel = () => {
      if (!carouselInterval) return;
      clearInterval(carouselInterval);
      carouselInterval = null;
    };

    const toggleMobile = () => {
      mobileNav?.classList.toggle("open");
    };

    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const submitContact = () => {
      const name = document.getElementById("cName")?.value.trim();
      const email = document.getElementById("cEmail")?.value.trim();
      const msg = document.getElementById("cMsg")?.value.trim();
      if (!name || !email || !msg) {
        alert("অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য পূরণ করুন।");
        return;
      }
      if (!isValidEmail(email)) {
        alert("অনুগ্রহ করে সঠিক ইমেইল ঠিকানা দিন।");
        return;
      }

      const formSuccess = document.getElementById("formSuccess");
      if (formSuccess) formSuccess.style.display = "block";
      ["cName", "cEmail", "cPhone", "cMsg", "cSubject"].forEach((id) => {
        const field = document.getElementById(id);
        if (field) field.value = "";
      });
      setTimeout(() => {
        if (formSuccess) formSuccess.style.display = "none";
      }, 5000);
    };

    const subscribeNewsletter = () => {
      const email = document.getElementById("nlEmail")?.value.trim();
      if (!isValidEmail(email || "")) {
        alert("অনুগ্রহ করে সঠিক ইমেইল ঠিকানা দিন।");
        return;
      }
      const nlSuccess = document.getElementById("nlSuccess");
      if (nlSuccess) nlSuccess.style.display = "block";
      const nlEmail = document.getElementById("nlEmail");
      if (nlEmail) nlEmail.value = "";
      setTimeout(() => {
        if (nlSuccess) nlSuccess.style.display = "none";
      }, 5000);
    };

    const onVisibilityChange = () => {
      if (document.hidden) stopCarousel();
      else startCarousel();
    };

    const onHamburgerKeyDown = (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleMobile();
      }
    };

    const onDocumentClick = (event) => {
      if (!mobileNav?.classList.contains("open")) return;
      if (!mobileNav.contains(event.target) && !hamburger?.contains(event.target)) {
        mobileNav.classList.remove("open");
      }
    };

    const onResize = () => {
      if (window.innerWidth > 640) mobileNav?.classList.remove("open");
    };

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add("visible");
            }, i * 80);
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((link) => link.classList.remove("active"));
          const activeLink = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
          if (activeLink) activeLink.classList.add("active");
        });
      },
      { threshold: 0.45 }
    );

    ["home", "about", "events", "services", "members", "contact"].forEach((id) => {
      const section = document.getElementById(id);
      if (section) sectionObserver.observe(section);
    });

    if (copyrightYear) {
      copyrightYear.textContent = new Intl.NumberFormat("bn-BD").format(
        new Date().getFullYear()
      );
    }

    window.addEventListener("scroll", onScroll);
    document.addEventListener("visibilitychange", onVisibilityChange);
    document.addEventListener("click", onDocumentClick);
    window.addEventListener("resize", onResize);
    hamburger?.addEventListener("keydown", onHamburgerKeyDown);
    heroCarousel?.addEventListener("mouseenter", stopCarousel);
    heroCarousel?.addEventListener("mouseleave", startCarousel);

    contactForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      submitContact();
    });

    newsletterForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      subscribeNewsletter();
    });

    window.goToSlide = goToSlide;
    window.toggleMobile = toggleMobile;

    startCarousel();
    onScroll();

    return () => {
      stopCarousel();
      revealObserver.disconnect();
      sectionObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.removeEventListener("click", onDocumentClick);
      window.removeEventListener("resize", onResize);
      hamburger?.removeEventListener("keydown", onHamburgerKeyDown);
      heroCarousel?.removeEventListener("mouseenter", stopCarousel);
      heroCarousel?.removeEventListener("mouseleave", startCarousel);
      delete window.goToSlide;
      delete window.toggleMobile;
    };
  }, []);

  return <main dangerouslySetInnerHTML={{ __html: pageMarkup }} />;
}
