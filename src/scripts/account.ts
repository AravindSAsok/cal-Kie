import { createClient } from "@supabase/supabase-js";
import { loadSavedPlan, savePlan } from "../lib/workout-store";

const url = import.meta.env.PUBLIC_SUPABASE_URL?.trim();
const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY?.trim();
const topbar = document.querySelector(".topbar-right");
const dialog = document.getElementById("calkie-account-dialog") as HTMLDialogElement | null;
const form = document.getElementById("calkie-account-form") as HTMLFormElement | null;
const emailInput = document.getElementById("calkie-account-email") as HTMLInputElement | null;
const passwordInput = document.getElementById("calkie-account-password") as HTMLInputElement | null;
const confirmInput = document.getElementById("calkie-account-confirm") as HTMLInputElement | null;
const confirmLabel = document.getElementById("calkie-account-confirm-label");
const emailLabel = emailInput?.closest("label");
const passwordLabel = passwordInput?.closest("label");
const status = document.getElementById("calkie-account-status");
const submit = document.getElementById("calkie-account-submit") as HTMLButtonElement | null;
const toggle = document.getElementById("calkie-account-toggle") as HTMLButtonElement | null;
const forgot = document.getElementById("calkie-account-forgot") as HTMLButtonElement | null;
const signout = document.getElementById("calkie-account-signout") as HTMLButtonElement | null;
const sessionActions = document.getElementById("calkie-account-session-actions");
const fields = document.getElementById("calkie-account-fields");
const profile = document.getElementById("calkie-account-profile");
const profileEmail = document.getElementById("calkie-account-profile-email");

if (topbar && dialog && form && emailInput && passwordInput && confirmInput && status && submit && toggle && forgot && signout && sessionActions && fields) {
  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "button button-quiet account-trigger";
  trigger.textContent = "Sign up / Log in";
  trigger.setAttribute("aria-haspopup", "dialog");
  topbar.append(trigger);

  if (!url || !anonKey) {
    trigger.disabled = true;
    trigger.textContent = "Account unavailable";
    trigger.title = "Configure PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY in Vercel.";
  } else {
    const supabase = createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
    type Mode = "signup" | "signin" | "recovery" | "set-password";
    let mode: Mode = "signup";

    const setStatus = (message: string, kind: "info" | "success" | "error" = "info") => {
      status.textContent = message;
      status.dataset.kind = kind;
    };

    const setMode = (next: Mode) => {
      mode = next;
      const recovery = mode === "recovery";
      const setting = mode === "set-password";
      submit.textContent = recovery ? "Send reset link" : setting ? "Save new password" : mode === "signup" ? "Create account" : "Log in";
      toggle.hidden = setting;
      toggle.textContent = mode === "signup" ? "Already have an account? Log in" : mode === "recovery" ? "Back to log in" : "New here? Create an account";
      forgot.hidden = mode !== "signin";
      if (emailLabel) (emailLabel as HTMLElement).hidden = setting;
      emailInput.required = !setting;
      if (passwordLabel) (passwordLabel as HTMLElement).hidden = recovery;
      passwordInput.hidden = recovery;
      passwordInput.required = !recovery;
      passwordInput.autocomplete = mode === "signup" || setting ? "new-password" : "current-password";
      confirmLabel!.hidden = !setting;
      confirmInput.required = setting;
      if (!setting) confirmInput.value = "";
      setStatus(recovery
        ? "Enter your email and we'll send you a secure password reset link."
        : setting
          ? "Choose a new password with at least 8 characters."
          : mode === "signup"
            ? "Create your Cal-Kie account to keep your workout plans synced across devices."
            : "Welcome back. Log in to access your saved workout plan.");
    };

    const refresh = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      const signedIn = Boolean(user && !user.is_anonymous);
      trigger.textContent = signedIn ? (user?.email || "My account") : "Sign up / Log in";
      fields.hidden = signedIn;
      sessionActions.hidden = !signedIn;
      toggle.hidden = signedIn;
      profile!.hidden = !signedIn;
      if (profileEmail) profileEmail.textContent = user?.email || "";
      if (!signedIn) setMode("signup");
      else setStatus("Your Cal-Kie account is connected. Your saved plans stay synced.");
    };

    const saveLocalPlanToAccount = async () => {
      const plan = await loadSavedPlan();
      if (plan) await savePlan(plan);
    };

    trigger.addEventListener("click", async () => {
      await refresh();
      if (!dialog.open) dialog.showModal();
    });
    dialog.querySelector("[data-close-account]")?.addEventListener("click", () => dialog.close());
    toggle.addEventListener("click", () => setMode(mode === "signup" ? "signin" : "signup"));
    forgot.addEventListener("click", () => setMode("recovery"));

    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        fields.hidden = false;
        sessionActions.hidden = true;
        setMode("set-password");
        setStatus("Reset link verified. Choose a new password to finish.");
        if (!dialog.open) dialog.showModal();
      }
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      if (mode !== "set-password" && !email) return setStatus("Enter your email address.", "error");
      if (mode !== "recovery" && password.length < 8) return setStatus("Password must be at least 8 characters.", "error");
      if (mode === "set-password" && password !== confirmInput.value) return setStatus("The passwords do not match.", "error");
      submit.disabled = true;
      try {
        const redirectTo = window.location.origin + "/";
        if (mode === "recovery") {
          const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
          if (error) throw error;
          setStatus("Password reset email sent to " + email + ". Open the link to choose a new password.", "success");
        } else if (mode === "set-password") {
          const { data, error } = await supabase.auth.getUser();
          if (error) throw error;
          if (!data.user) throw new Error("Your recovery session expired. Request a new reset link.");
          const { error: updateError } = await supabase.auth.updateUser({ password });
          if (updateError) throw updateError;
          passwordInput.value = "";
          confirmInput.value = "";
          await refresh();
          setStatus("Your password has been updated.", "success");
        } else if (mode === "signup") {
          const { data: session } = await supabase.auth.getSession();
          if (session.session?.user.is_anonymous) {
            const { data, error } = await supabase.auth.updateUser(
              { email, password },
              { emailRedirectTo: redirectTo }
            );
            if (error) throw error;
            if (data.user && !data.user.is_anonymous && session.session) {
              await saveLocalPlanToAccount();
              window.location.reload();
              return;
            }
          } else {
            const { data, error } = await supabase.auth.signUp({
              email, password, options: { emailRedirectTo: redirectTo }
            });
            if (error) throw error;
            if (data.session) {
              await saveLocalPlanToAccount();
              window.location.reload();
              return;
            }
          }
          setStatus("Verification email sent to " + email + ". Confirm your address, then return here to log in.", "success");
          setMode("signin");
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
          if (data.user) await saveLocalPlanToAccount();
          await refresh();
          setStatus("You're logged in. Your Cal-Kie account is ready.", "success");
        }
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Something went wrong. Please try again.", "error");
      } finally {
        submit.disabled = false;
        submit.textContent = mode === "recovery" ? "Send reset link" : mode === "set-password" ? "Save new password" : mode === "signup" ? "Create account" : "Log in";
      }
    });

    signout.addEventListener("click", async () => {
      signout.disabled = true;
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        await refresh();
        setStatus("You have been logged out. Your workout plan remains saved on this device.");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Could not log out.", "error");
      } finally {
        signout.disabled = false;
      }
    });

    void refresh();
  }
}
