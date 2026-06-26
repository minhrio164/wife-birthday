import { gsap } from "gsap"

let loadingTimeline: gsap.core.Timeline | undefined

export function renderLoadingScreen(root: HTMLElement, onEnter: () => void) {
  root.innerHTML = `
    <section class="loading-screen" data-loading="true">
      <svg class="loading-circles" viewBox="0 0 1400 1400" aria-hidden="true">
        <defs>
          <path id="loading-circle-1" d="M250,700.5A450.5,450.5 0 1 1 1151,700.5A450.5,450.5 0 1 1 250,700.5" />
          <path id="loading-circle-2" d="M382,700.5A318.5,318.5 0 1 1 1019,700.5A318.5,318.5 0 1 1 382,700.5" />
          <path id="loading-circle-3" d="M487,700.5A213.5,213.5 0 1 1 914,700.5A213.5,213.5 0 1 1 487,700.5" />
          <path id="loading-circle-4" d="M567.5,700.5A133,133 0 1 1 833.5,700.5A133,133 0 1 1 567.5,700.5" />
        </defs>
        <text class="loading-circle-text loading-circle-text--1">
          <textPath href="#loading-circle-1" textLength="2830">Happy Birthday Happy Birthday Happy Birthday&nbsp;</textPath>
        </text>
        <text class="loading-circle-text loading-circle-text--2">
          <textPath href="#loading-circle-2" textLength="2001">Happy Birthday Happy Birthday&nbsp;</textPath>
        </text>
        <text class="loading-circle-text loading-circle-text--3">
          <textPath href="#loading-circle-3" textLength="1341">Happy Birthday Happy&nbsp;</textPath>
        </text>
        <text class="loading-circle-text loading-circle-text--4">
          <textPath href="#loading-circle-4" textLength="836">Happy Birthday&nbsp;</textPath>
        </text>
      </svg>
      <div class="loading-center">
        <button class="loading-enter" type="button" aria-label="Enter birthday gallery">
          <span class="loading-enter__bg"></span>
          <span class="loading-enter__text">Enter</span>
        </button>
      </div>
    </section>
  `

  const enterButton = root.querySelector<HTMLButtonElement>(".loading-enter")
  const enterBackground = root.querySelector<HTMLElement>(".loading-enter__bg")
  const circleText = Array.from(root.querySelectorAll<SVGTextElement>(".loading-circle-text"))

  gsap.set(circleText, {
    transformOrigin: "50% 50%",
    opacity: 0,
    scale: 0.3,
  })
  gsap.set(enterButton, {
    opacity: 0,
    scale: 0.7,
    pointerEvents: "none",
  })

  loadingTimeline = gsap.timeline().to(
    [...circleText, enterButton].filter(Boolean),
    {
      duration: 2.2,
      ease: "expo.out",
      opacity: 1,
      scale: 1,
      stagger: {
        amount: 0.45,
      },
    },
    0
  )
  loadingTimeline.add(() => {
    gsap.set(enterButton, { pointerEvents: "auto" })
  }, 0.85)

  const handleEnterHover = () => {
    gsap.killTweensOf([enterBackground, circleText])
    gsap.to(enterBackground, {
      duration: 0.8,
      ease: "power4.out",
      scale: 1.18,
      opacity: 1,
    })

    gsap.to(circleText, {
      duration: 4,
      ease: "power4.out",
      rotation: "+=180",
      stagger: {
        amount: -0.3,
      },
    })
  }

  const handleEnterLeave = () => {
    gsap.to(enterBackground, {
      duration: 0.8,
      ease: "power4.out",
      scale: 1,
    })
  }

  enterButton?.addEventListener("mouseenter", handleEnterHover)
  enterButton?.addEventListener("mouseleave", handleEnterLeave)
  enterButton?.addEventListener(
    "click",
    () => {
      enterButton.removeEventListener("mouseenter", handleEnterHover)
      enterButton.removeEventListener("mouseleave", handleEnterLeave)
      enterButton.disabled = true
      enterButton.classList.add("loading-enter--active")
      loadingTimeline?.kill()
      gsap.set(enterButton, { pointerEvents: "none" })
      gsap
        .timeline({
          onComplete: onEnter,
        })
        .to(enterButton, {
          duration: 1,
          ease: "expo.inOut",
          scale: 0.68,
          opacity: 0,
        })
        .to(
          circleText,
          {
            duration: 1,
            ease: "expo.inOut",
            scale: (index) => 1.3 + (circleText.length - index) * 0.18,
            opacity: 0,
            stagger: {
              amount: 0.16,
            },
          },
          0
        )
    },
    { once: true }
  )
}

export function clearLoadingScreen(root: HTMLElement) {
  loadingTimeline?.kill()
  loadingTimeline = undefined
  root.innerHTML = ""
}
