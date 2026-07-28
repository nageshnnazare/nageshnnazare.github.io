// Static card wrapper. Previously this tilted and tracked the mouse, which made
// every card on the page move at once — too much motion. It now simply renders
// its children with the given class so cards stay still; hover feedback (a
// border/shadow shift) is handled by CSS on the card surfaces themselves.
export default function TiltCard({ children, className = '' }) {
  return <div className={className}>{children}</div>
}
