import { useState, ReactNode, FormEvent, ChangeEvent } from "react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Mail, Lock, User, Eye, EyeOff, LogIn, LightbulbOff, ArrowLeft, ArrowRight, UserCheck } from "lucide-react"

import { useAuth } from "./hook"
import { Label } from "@/components/ui/label"

type LoginDialogProps = {
  children?: ReactNode
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

type IconInputProps = {
  icon: React.ElementType
  type?: string
  placeholder?: string
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  rightElement?: ReactNode
}

function IconInput({
  icon: Icon,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
  rightElement,
}: IconInputProps) {
  return (
    <div className="relative flex items-center">
      <Icon className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="pl-9 pr-9"
      />
      {rightElement && (
        <div className="absolute right-3">{rightElement}</div>
      )}
    </div>
  )
}

type PasswordInputProps = {
  placeholder?: string
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  required?: boolean
}

function PasswordInput({
  placeholder,
  value,
  onChange,
  required,
}: PasswordInputProps) {

  const [show, setShow] = useState<boolean>(false)

  return (
    <IconInput
      icon={Lock}
      type={show ? "text" : "password"}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      rightElement={
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      }
    />
  )
}

const COPY = {
  signIn: {
    title: "Sign in",
    subtitle: "Hello! Log in if you already have an account. Set a new one in a minute if you're new here.",
    button: "Sign in",
    toggleQuestion: "Don't have an account?",
    toggleAction: "Sign up",
  },
  signUp: {
    title: "Create your account",
    subtitle: "An account in VocaB will elevate your experience allowing you to use the AI assistant.",
    button: "Create account",
    toggleQuestion: "Already have an account?",
    toggleAction: "Sign in",
  },
}

export default function LoginDialog({ children }: LoginDialogProps) {
  const [isSignUp, setIsSignUp] = useState<boolean>(false)
  const [email, setEmail] = useState<string>("")
  const [username, setUsername] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")
  const [localError, setLocalError] = useState<string | null>(null)

  const { loading, error: authError, signIn, signUp, signInWithOAuth } = useAuth()

  const error = localError ?? authError
  const copy = isSignUp ? COPY.signUp : COPY.signIn

  function handleToggle() {
    setIsSignUp(!isSignUp)
    setLocalError(null)
    setPassword("")
    setConfirmPassword("")
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLocalError(null)

    if (isSignUp && password !== confirmPassword) {
      setLocalError("Passwords don't match.")
      return
    }

    if (isSignUp) {
      await signUp({ email, username, password })
    } else {
      await signIn({ email, password })
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children ?? <Button className="h-fit! w-8" variant="outline"><LogIn size={14}></LogIn></Button>}
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl p-0">
        <div className="flex flex-col p-6 gap-4">
          <DialogHeader className="gap-1">
            <DialogTitle className="text-2xl font-semibold flex flex-row gap-3 items-center mb-2">
              {!isSignUp && <LogIn></LogIn>} {isSignUp && <UserCheck></UserCheck>} { }  {copy.title}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {copy.subtitle}
            </p>
          </DialogHeader>

          <Button
            variant="outline"
            className="w-full flex items-center gap-3"
            onClick={() => signInWithOAuth("google")}
            disabled={loading}
          >
            <GoogleIcon />
            Continue with Google
          </Button>

          <div className="flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-sm text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-2 bg-accent/5 px-6 pt-4 pb-6 rounded-2xl border">
            {isSignUp && (<div className="flex flex-col gap-2">
              <Label className="text-xs">Username</Label>

              <IconInput
                icon={User}
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />

            </div>)}
            <div className="flex flex-col mt-2 gap-2">
              <Label className="text-xs">User Email</Label>
              <IconInput
                icon={Mail}
                type="email"
                placeholder="john@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col mt-2 gap-2 mb-8">
              <Label className="text-xs">Password</Label>
              <PasswordInput
                placeholder="***"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {!isSignUp && (
                <p className="flex flex-row gap-2 items-center text-xs text-end mt-2"> <LightbulbOff size={14}></LightbulbOff> Forgot your password? {" "}
                  <button
                    type="button"
                    className="text-primary hover:underline"
                  >
                    Click here
                  </button></p>
              )}
              {isSignUp && (
                <PasswordInput
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              )}
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <hr className="-mt-5 p-1"></hr>

            <Button type="submit" disabled={loading} className="w-full mt-1">
              <LogIn></LogIn> {loading ? "Please wait..." : copy.button}
            </Button>
            {isSignUp && (
              <p className="text-xs mt-2">
                By creating an account you comply with our <b>Terms of Use and Service</b>. You can check them out in our webpage or through this link
              </p>
            )}
          </form>

          <p className="text-sm text-center text-muted-foreground">
            {copy.toggleQuestion}{" "}
            <button
              type="button"
              onClick={handleToggle}
              className="text-primary hover:underline"
            >
              {copy.toggleAction}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}