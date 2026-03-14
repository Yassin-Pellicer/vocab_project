declare module "lodash.throttle" {
  export type ThrottleSettings = {
    leading?: boolean;
    trailing?: boolean;
  };

  export default function throttle<F extends (...args: unknown[]) => unknown>(
    func: F,
    wait?: number,
    options?: ThrottleSettings,
  ): F & { cancel: () => void; flush: () => void };
}
