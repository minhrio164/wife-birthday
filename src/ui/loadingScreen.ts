export function renderLoadingScreen(root: HTMLElement) {
  root.innerHTML = `
    <section class="loading-screen" data-loading="true">
      <div class="loading-orb orb-a"></div>
      <div class="loading-orb orb-b"></div>
      <div class="loading-orb orb-c"></div>
      <div class="loading-panel">
        <div class="loading-badge">Birthday surprise</div>
        <p class="loading-kicker">Phien ban demo tam thoi</p>
        <h1>Chuc mung sinh nhat em</h1>
        <p>Dang mo album qua tang, sap dua em vao bo suu tap ky niem lung linh nhat.</p>
        <div class="loading-progress">
          <span></span>
        </div>
      </div>
      <div class="loading-confetti" aria-hidden="true"></div>
    </section>
  `
}

export function clearLoadingScreen(root: HTMLElement) {
  root.innerHTML = ""
}
