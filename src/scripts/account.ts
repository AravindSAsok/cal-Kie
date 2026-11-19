import { loadSavedPlan, savePlan } from "../lib/workout-store";

const topbar = document.querySelector(".topbar-right");
const dialog = document.getElementById("calkie-account-dialog") as HTMLDialogElement | null;
const form = document.getElementById("calkie-account-form") as HTMLFormElement | null;
const nameInput = document.getElementById("calkie-account-name") as HTMLInputElement | null;
const nameLabel = nameInput?.closest("label") as HTMLElement | null;
const emailInput = document.getElementById("calkie-account-email") as HTMLInputElement | null;
const passwordInput = document.getElementById("calkie-account-password") as HTMLInputElement | null;
const status = document.getElementById("calkie-account-status");
const submit = document.getElementById("calkie-account-submit") as HTMLButtonElement | null;
const toggle = document.getElementById("calkie-account-toggle") as HTMLButtonElement | null;
const forgot = document.getElementById("calkie-account-forgot") as HTMLButtonElement | null;
const signout = document.getElementById("calkie-account-signout") as HTMLButtonElement | null;
const sessionActions = document.getElementById("calkie-account-session-actions");
const fields = document.getElementById("calkie-account-fields");
const profile = document.getElementById("calkie-account-profile");
const profileEmail = document.getElementById("calkie-account-profile-email");

if (topbar && dialog && form && emailInput && passwordInput && status && submit && toggle && forgot && signout && sessionActions && fields) {
  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "button button-quiet account-trigger";
  trigger.textContent = "Sign up / Log in";
  trigger.setAttribute("aria-haspopup", "dialog");
  topbar.append(trigger);

  type Mode = "signup" | "signin";
  let mode: Mode = "signup";

  const setStatus = (message: string, kind: "info" | "success" | "error" = "info") => {
    status.textContent = message;
    (status as HTMLElement).dataset.kind = kind;
  };

  const setMode = (next: Mode) => {
    mode = next;
    const signup = mode === "signup";
    if (nameLabel) nameLabel.hidden = !signup;
    if (nameInput) nameInput.required = signup;
    submit.textContent = signup ? "Create account" : "Log in";
    toggle.textContent = signup ? "Already have an account? Log in" : "New here? Create an account";
    forgot.hidden = signup;
    passwordInput.autocomplete = signup ? "new-password" : "current-password";
    setStatus(signup
      ? "Create your Cal-Kie account to keep workout plans synced across devices."
      : "Welcome back. Log in to access your saved workout plan.");
  };

  const refresh = async () => {
    const response = await fetch("/api/auth/me", { credentials: "same-origin", cache: "no-store" });
    const payload = await response.json().catch(() => ({})) as { user?: { name?: string; email?: string } | null; error?: string };
    if (!response.ok) throw new Error(payload.error || "Account service is unavailable.");
    const user = payload.user;
    const signedIn = Boolean(user);
    trigger.textContent = signedIn ? (user?.email || "My account") : "Sign up / Log in";
    fields.hidden = signedIn;
    sessionActions.hidden = !signedIn;
    toggle.hidden = signedIn;
    profile!.hidden = !signedIn;
    if (profileEmail) profileEmail.textContent = user?.email || "";
    if (!signedIn) setMode("signup");
    else setStatus("Your Cal-Kie account is connected. Your workout plans sync with MongoDB.");
  };

  const saveLocalPlanToAccount = async () => {
    const plan = await loadSavedPlan();
    if (plan) await savePlan(plan);
  };

  trigger.addEventListener("click", async () => {
    try { await refresh(); }
    catch (error) { setStatus(error instanceof Error ? error.message : "Account service is unavailable.", "error"); }
    if (!dialog.open) dialog.showModal();
  });
  dialog.querySelector("[data-close-account]")?.addEventListener("click", () => dialog.close());
  toggle.addEventListener("click", () => setMode(mode === "signup" ? "signin" : "signup"));
  forgot.addEventListener("click", () => setStatus("Password recovery email is not configured yet. Your account remains safe; contact support to reset access.", "info"));

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = nameInput?.value.trim() || emailInput.value.trim().split("@")[0];
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    if (!email) return setStatus("Enter your email address.", "error");
    if (mode === "signup" && name.length < 2) return setStatus("Enter your name.", "error");
    if (password.length < 8) return setStatus("Password must be at least 8 characters.", "error");
    submit.disabled = true;
    try {
      const response = await fetch(mode === "signup" ? "/api/auth/signup" : "/api/auth/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "signup" ? { name, email, password } : { email, password })
      });
      const payload = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Could not complete account request.");
      await saveLocalPlanToAccount();
      await refresh();
      passwordInput.value = "";
      setStatus(mode === "signup" ? "Your Cal-Kie account is ready. Your saved week has been synced." : "You're logged in. Your saved week is ready.", "success");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Something went wrong. Please try again.", "error");
    } finally {
      submit.disabled = false;
      submit.textContent = mode === "signup" ? "Create account" : "Log in";
    }
  });

  signout.addEventListener("click", async () => {
    signout.disabled = true;
    try {
      const response = await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
      if (!response.ok) throw new Error("Could not log out.");
      await refresh();
      setStatus("You have been logged out. Your workout plan remains saved on this device.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not log out.", "error");
    } finally {
      signout.disabled = false;
    }
  });

  void refresh().catch((error) => setStatus(error instanceof Error ? error.message : "MongoDB account service is unavailable.", "error"));
}
