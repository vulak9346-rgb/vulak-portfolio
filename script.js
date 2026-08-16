document.body.classList.add("js-enabled");

const revealElements = document.querySelectorAll(".reveal");

function showAllRevealElements() {
  revealElements.forEach(element => {
    element.classList.add("visible");
  });
}

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  revealElements.forEach(element => {
    revealObserver.observe(element);
  });
} else {
  showAllRevealElements();
}

window.addEventListener("load", () => {
  setTimeout(showAllRevealElements, 800);
});

const pageGlow = document.querySelector(".page-glow");

if (pageGlow) {
  window.addEventListener("pointermove", event => {
    pageGlow.style.left = `${event.clientX}px`;
    pageGlow.style.top = `${event.clientY}px`;
  });
}

const tiltCards = document.querySelectorAll(".tilt-card");

tiltCards.forEach(card => {
  card.addEventListener("pointermove", event => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const rotateY = ((x / rect.width) - 0.5) * 8;
    const rotateX = ((y / rect.height) - 0.5) * -8;

    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  });

  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});