import Image from "next/image";

export function BrandLogo({ className = "" }: { className?: string }) {
  return <Image src="/brand/colasoft-logo.png" alt="科来网络" width={134} height={40} priority className={`colasoft-logo ${className}`} />;
}
