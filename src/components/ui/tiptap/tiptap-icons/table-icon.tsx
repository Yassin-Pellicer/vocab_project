import { memo } from "react"

type SvgProps = React.ComponentPropsWithoutRef<"svg">

export const TableIcon = memo(({ className, ...props }: SvgProps) => {
  return (
    <svg
      width="24"
      height="24"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        x="3"
        y="4"
        width="18"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M3 9H21" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 14H21" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 4V20" stroke="currentColor" strokeWidth="1.5" />
      <path d="M15 4V20" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
})

TableIcon.displayName = "TableIcon"
