import { useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  LogIn,
  Mail,
  MailIcon,
  ShieldCheck,
  User,
  UserPlus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoadingOverlay from "@/components/ui/loading-overlay";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "./hook";

type LoginDialogProps = {
  children?: ReactNode;
};

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

type IconInputProps = {
  id: string;
  icon: React.ElementType;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  autoComplete?: string;
  rightElement?: ReactNode;
};

function IconInput({
  id,
  icon: Icon,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
  autoComplete,
  rightElement,
}: IconInputProps) {
  return (
    <div className="relative flex items-center">
      <Icon className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted-foreground" />
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        className="h-10 rounded-lg border-foreground/10 bg-background/70 pl-10 pr-10"
      />
      {rightElement ? <div className="absolute right-3">{rightElement}</div> : null}
    </div>
  );
}

type PasswordInputProps = {
  id: string;
  placeholder?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  autoComplete?: string;
  alwaysVisible?: boolean;
};

function PasswordInput({
  id,
  placeholder,
  value,
  onChange,
  required,
  autoComplete,
  alwaysVisible = false,
}: PasswordInputProps) {
  const [show, setShow] = useState(false);
  const visible = alwaysVisible || show;

  return (
    <IconInput
      id={id}
      icon={Lock}
      type={visible ? "text" : "password"}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      autoComplete={autoComplete}
      rightElement={alwaysVisible ? null : (
        <button
          type="button"
          onClick={() => setShow((prev) => !prev)}
          className="text-muted-foreground transition-colors hover:text-foreground"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      )}
    />
  );
}

const COPY = {
  signIn: {
    title: "Welcome back",
    subtitle: "Sign in to continue your vocabulary training and synced progress.",
    button: "Sign in",
    switchText: "New here? Create an account",
  },
  signUp: {
    title: "Create account",
    subtitle: "Set up your profile to sync dictionaries and unlock assistant features.",
    button: "Create account",
    switchText: "Already registered? Sign in",
  },
};

const MIN_OAUTH_OVERLAY_MS = 500;

export default function LoginDialog({ children }: LoginDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const {
    loading,
    error: authError,
    signIn,
    signUp,
    signInWithOAuth,
    resetPassword,
  } = useAuth();

  const copy = isSignUp ? COPY.signUp : COPY.signIn;
  const error = localError ?? authError;
  const overlayLoading = loading || oauthLoading;

  const resetUi = () => {
    setLocalError(null);
    setNotice(null);
    setPassword("");
    setConfirmPassword("");
  };

  const switchMode = (toSignUp: boolean) => {
    setIsSignUp(toSignUp);
    resetUi();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);
    setNotice(null);

    const trimmedEmail = email.trim();
    const trimmedUsername = username.trim();

    if (!trimmedEmail) {
      setLocalError("Email is required.");
      return;
    }

    if (isSignUp && trimmedUsername.length < 2) {
      setLocalError("Username must be at least 2 characters.");
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    if (isSignUp) {
      await signUp({ email: trimmedEmail, username: trimmedUsername, password });
      return;
    }

    await signIn({ email: trimmedEmail, password });
  };

  const handleForgotPassword = async () => {
    setLocalError(null);
    setNotice(null);
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setLocalError("Enter your email first, then request a password reset.");
      return;
    }

    const sent = await resetPassword(trimmedEmail);
    if (sent) {
      setNotice("Password reset email sent. Check your inbox.");
    }
  };

  const handleGoogleAuth = async () => {
    setOauthLoading(true);
    setLocalError(null);
    setNotice(null);
    const startedAt = Date.now();

    try {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
      await signInWithOAuth("google");
    } finally {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, MIN_OAUTH_OVERLAY_MS - elapsed);
      if (remaining > 0) {
        await new Promise((resolve) => setTimeout(resolve, remaining));
      }
      setOauthLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) resetUi();
      }}
    >
      <DialogTrigger asChild>
        {children ?? (
          <Button className="h-fit! w-8" variant="outline">
            <LogIn size={14} />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="p-0 sm:max-w-4xl md:max-w-5xl xl:max-w-6xl h-[70vh]">
        <div className="grid md:grid-cols-[40%_60%] h-full">
          <div className="relative hidden min-h-140 overflow-hidden md:block">
            <div className="absolute inset-0 bg-accent/20 rounded-l-md" />
            <div className="relative flex h-full flex-col justify-between p-8 text-foreground">
              <div>
                <h2 className="mt-6 text-3xl leading-tight font-semibold text-foreground">
                  Build consistency,
                  <br />
                  not just streaks.
                </h2>
                <p className="mt-3 max-w-sm text-sm text-muted-foreground">
                  Keep words, notes and progress in sync while you move between dictionaries.
                </p>
              </div>
              <div className="space-y-3">
                <div className="rounded-xl border border-border/60 bg-card/70 p-3">
                  <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    Private account access
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Email + password or one-tap Google sign in.
                  </p>
                </div>
                <div className="rounded-xl border border-border/60 bg-card/70 p-3">
                  <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <KeyRound className="h-4 w-4 text-primary" />
                    Recovery tools included
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Reset password directly from the same dialog.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <LoadingOverlay
            loading={overlayLoading}
            title="Loading"
            subtitle={
              oauthLoading
                ? "Connecting to Google..."
                : isSignUp
                  ? "Creating your account..."
                  : "Signing you in..."
            }
            className="h-full"
            overlayClassName="rounded-r-md"
          >
          <div className="flex h-full flex-col bg-background p-6 sm:p-8 overflow-auto">
            <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg border bg-muted/30 p-1">
              <button
                type="button"
                onClick={() => switchMode(false)}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${!isSignUp
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => switchMode(true)}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${isSignUp
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Create account
              </button>
            </div>
            
            <DialogHeader className="mb-5 gap-2 text-left">
              <DialogTitle className="flex items-center gap-2 text-2xl">
                {isSignUp ? <UserPlus className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
                {copy.title}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">{copy.subtitle}</p>
            </DialogHeader>

              <Button
                type="button"
                variant="outline"
                className="h-10 w-full justify-center gap-3 rounded-lg"
                onClick={() => void handleGoogleAuth()}
                disabled={overlayLoading}
              >
                <GoogleIcon />
                Continue with Google
              </Button>

            <div className="my-5 flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="flex flex-row items-center gap-2 text-xs text-muted-foreground">or <MailIcon size={14}/></span>
              <Separator className="flex-1" />
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-3 rounded-xl border border-foreground/10 bg-card/45 p-4"
            >
              {isSignUp ? (
                <div className="space-y-1.5">
                  <Label htmlFor="login-username" className="text-xs text-muted-foreground">
                    Username
                  </Label>
                  <IconInput
                    id="login-username"
                    icon={User}
                    placeholder="Your name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                  />
                </div>
              ) : null}

              <div className="space-y-1.5">
                <Label htmlFor="login-email" className="text-xs text-muted-foreground">
                  Email
                </Label>
                <IconInput
                  id="login-email"
                  icon={Mail}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="login-password" className="text-xs text-muted-foreground">
                  Password
                </Label>
                <PasswordInput
                  id="login-password"
                  placeholder={isSignUp ? "Create a password" : "Enter your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  alwaysVisible={isSignUp}
                />
              </div>

              {isSignUp ? (
                <div className="space-y-1.5">
                  <Label htmlFor="login-confirm-password" className="text-xs text-muted-foreground">
                    Confirm password
                  </Label>
                  <PasswordInput
                    id="login-confirm-password"
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    alwaysVisible
                  />
                </div>
              ) : (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => void handleForgotPassword()}
                      className="text-xs text-primary transition-colors hover:text-primary/80"
                      disabled={overlayLoading}
                    >
                      Forgot your password?
                    </button>
                </div>
              )}

              {notice ? (
                <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">
                  {notice}
                </p>
              ) : null}

              {error ? (
                <p className="rounded-md border border-destructive/35 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {error}
                </p>
              ) : null}

                <Button type="submit" disabled={overlayLoading} className="mt-2 h-10 w-full rounded-lg">
                  {overlayLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Please wait...
                  </>
                ) : (
                  <>
                    {copy.button}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <button
              type="button"
              onClick={() => switchMode(!isSignUp)}
              className="mt-4 w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {copy.switchText}
            </button>
          </div>
          </LoadingOverlay>
        </div>
      </DialogContent>
    </Dialog>
  );
}
