document.addEventListener("DOMContentLoaded", () => {
  const scrollContainer = document.querySelector(".scroll-container");
  const images = document.querySelectorAll(".container img");
  const textImages = document.querySelectorAll('.container img[class*="text"]'); // 문구 이미지
  const FINAL_REVEAL_TIME = 70000; // 70초 후 모든 이미지 등장
  const REPEAT_INTERVAL = 100000; // 100초마다 반복 (그라데이션 다시 시작)
  const audio = new Audio("ding.mp3"); // 클릭 시 소리
  const spotlightSize = 150;
  const zoomScale = 1.5;
  const animations = ["fade-in-out", "scale-pulse", "shake-hint"];
  const container = document.getElementById("container");
  let isZoomed = false;

  // 초기 이미지 상태 숨기기
  function resetImages() {
    images.forEach((img) => {
      img.style.opacity = "0";
      img.style.transform = "scale(0.9)";
      img.classList.remove(...animations, "hover-effect", "found-effect");
      img.dataset.revealed = "false";
    });
    container.style.maskImage = ""; // 마스크 초기화
    container.style.webkitMaskImage = "";
  }

  // 랜덤 힌트 애니메이션 적용
  function applyRandomHintAnimation(img) {
    const randomAnimation =
      animations[Math.floor(Math.random() * animations.length)];
    img.classList.add(randomAnimation);
    setTimeout(() => img.classList.remove(randomAnimation), 5000);
  }

  // PNG 즉시 등장 및 힌트 애니메이션
  function startHideAndSeek() {
    images.forEach((img) => {
      const randomDelay = Math.random() * 5000; // 0~5초 사이 랜덤 딜레이
      setTimeout(() => {
        img.style.opacity = "0.2";
        applyRandomHintAnimation(img);
      }, randomDelay);
    });
  }

  // 70초 후 모든 이미지 등장 및 마스크 제거
  function revealAllImages() {
    images.forEach((img) => {
      img.style.transition = "opacity 3s ease-in-out, transform 3s ease-in-out";
      img.style.opacity = "1";
      img.style.transform = "scale(1)";
      img.classList.remove(...animations);
    });
    container.style.maskImage = "none";
    container.style.webkitMaskImage = "none";
  }

  // 100초 후 마스크 및 숨바꼭질 애니메이션 재시작
  function restartMaskAndAnimations() {
    resetImages();
    startHideAndSeek();
    container.style.maskImage = `radial-gradient(circle ${spotlightSize}px at 50% 50%, 
      rgba(0, 0, 0, 1) 100%, transparent 100%)`;
    container.style.webkitMaskImage = container.style.maskImage;
  }

  // 100초마다 마스크 및 애니메이션 재시작
  function repeatAnimations() {
    setInterval(() => {
      restartMaskAndAnimations();
    }, REPEAT_INTERVAL);
  }

  // 마우스 호버 효과
  images.forEach((img) => {
    img.addEventListener("mouseenter", () => img.classList.add("hover-effect"));
    img.addEventListener("mouseleave", () =>
      img.classList.remove("hover-effect")
    );

    // 클릭 이벤트
    img.addEventListener("click", (e) => {
      e.stopPropagation();
      if (img.dataset.revealed === "true") return;

      img.classList.remove(...animations, "hover-effect");
      img.classList.add("found-effect");
      img.style.opacity = "1";
      img.style.transform = "scale(1)";
      img.dataset.revealed = "true";

      audio.play();

      setTimeout(() => img.classList.remove("found-effect"), 1000);
    });
  });

  // 스포트라이트 효과
  container.addEventListener("mousemove", (e) => {
    const rect = container.getBoundingClientRect();
    let mouseX = e.clientX - rect.left;
    let mouseY = e.clientY - rect.top;

    if (isZoomed) {
      mouseX = mouseX / zoomScale;
      mouseY = mouseY / zoomScale;
    }

    container.style.maskImage = `radial-gradient(circle ${spotlightSize}px at ${mouseX}px ${mouseY}px, 
      rgba(0, 0, 0, 1) 100%, transparent 100%)`;
    container.style.webkitMaskImage = container.style.maskImage;
  });

  // 더블 클릭 이벤트 (줌 인/줌 아웃)
  container.addEventListener("dblclick", (e) => {
    e.stopPropagation();
    const rect = container.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 100;
    const mouseY = ((e.clientY - rect.top) / rect.height) * 100;

    if (!isZoomed) {
      container.style.transformOrigin = `${mouseX}% ${mouseY}%`;
      container.style.transform = `scale(${zoomScale})`;
    } else {
      container.style.transformOrigin = "center center";
      container.style.transform = "scale(1)";
    }

    isZoomed = !isZoomed;
  });

  // 마우스 휠로 가로 스크롤
  let isScrolling = false;
  window.addEventListener("wheel", (event) => {
    event.preventDefault();
    if (!isScrolling) {
      isScrolling = true;
      requestAnimationFrame(() => {
        scrollContainer.scrollLeft += event.deltaY;
        isScrolling = false;
      });
    }
  });

  // 초기 실행
  resetImages();
  startHideAndSeek();

  setTimeout(revealAllImages, FINAL_REVEAL_TIME); // 70초 후 마스크 제거
  setTimeout(restartMaskAndAnimations, REPEAT_INTERVAL); // 100초 후 다시 마스크 적용
  repeatAnimations(); // 반복적으로 숨바꼭질 실행
});
