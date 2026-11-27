type AccountUser = { id: string; name?: string; email?: string };

const slots = Array.from(document.querySelectorAll<HTMLElement>("[data-account-slot]"));

const initials = (value: string) =>
  value.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "CK";

function avatarFor(user: AccountUser): HTMLSpanElement {
  const el = document.createElement("span");
  el.className = "account-avatar";
  el.textContent = initials(user.name || user.email || "");
  el.setAttribute("aria-hidden", "true");
  return el;
}

function button(label: string, className: string, onClick?: () => void, href?: string): HTMLElement {
  let el: HTMLElement;
  if (href) {
    const link = document.createElement("a");
    link.href = href;
    el = link;
  } else {
    const btn = document.createElement("button");
    btn.type = "button";
    el = btn;
  }
  el.className = className;
  el.textContent = label;
  if (onClick) el.addEventListener("click", onClick);
  return el;
}

async function signOut(target: HTMLButtonElement) {
  target.disabled = true;
  target.textContent = "Signing out…";
  try {
    const response = await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    if (!response.ok) throw new Error("Sign out failed.");
    location.assign("/signin");
  } catch {
    target.disabled = false;
    target.textContent = "Log out";
  }
}

function renderSlot(slot: HTMLElement, user: AccountUser | null) {
  slot.replaceChildren();
  const box = document.createElement("div");
  box.className = "account-box";

  const row = document.createElement("div");
  row.className = "account-user";
  const meta = document.createElement("div");
  meta.className = "account-meta";
  const title = document.createElement("strong");
  const subtitle = document.createElement("small");

  if (user) {
    row.append(avatarFor(user));
    title.textContent = user.name || "Signed in";
    subtitle.textContent = user.email || "Your plan syncs to this account";
  } else {
    const guest = document.createElement("span");
    guest.className = "account-avatar";
    guest.textContent = "?";
    guest.setAttribute("aria-hidden", "true");
    row.append(guest);
    title.textContent = "Your account";
    subtitle.textContent = "Save plans to the cloud";
  }

  meta.append(title, subtitle);
  row.append(meta);

  const actions = document.createElement("div");
  actions.className = "account-actions";
  if (user) {
    const out = button("Log out", "ig-btn", () => void signOut(out as HTMLButtonElement));
    actions.append(out);
  } else {
    actions.append(
      button("Sign in", "ig-btn ig-btn-primary", undefined, "/signin"),
      button("Sign up", "ig-btn", undefined, "/signup")
    );
  }

  box.append(row, actions);
  slot.append(box);
}

/** Signed-in visitors land on /signin by mistake; show their session instead of a blank form. */
function renderSignedInNotice(user: AccountUser) {
  const card = document.querySelector<HTMLElement>("[data-auth-page]");
  if (!card) return;
  card.replaceChildren();

  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = "You're signed in";
  const heading = document.createElement("h1");
  heading.textContent = user.name || "Welcome back";
  const description = document.createElement("p");
  description.className = "auth-description";
  description.textContent = user.email || "Your plans sync with this account.";

  const actions = document.createElement("div");
  actions.className = "account-actions";
  actions.append(button("Plan my week", "ig-btn ig-btn-primary", undefined, "/workout-builder"));
  const out = button("Log out", "ig-btn", () => void signOut(out as HTMLButtonElement));
  actions.append(out);

  const back = document.createElement("p");
  back.className = "auth-switch";
  const backLink = document.createElement("a");
  backLink.href = "/";
  backLink.textContent = "Back to your training plan";
  back.append(backLink);

  card.append(eyebrow, heading, description, actions, back);
}

async function readUser(): Promise<AccountUser | null> {
  try {
    const response = await fetch("/api/auth/me", { credentials: "same-origin", cache: "no-store" });
    if (!response.ok) return null;
    const body = await response.json() as { user?: AccountUser | null };
    return body.user ?? null;
  } catch {
    return null;
  }
}

void (async () => {
  const user = await readUser();
  for (const slot of slots) renderSlot(slot, user);
  if (user) renderSignedInNotice(user);
})();
