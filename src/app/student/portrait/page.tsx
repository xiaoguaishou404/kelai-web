import { redirect } from "next/navigation";

export default function PortraitRedirect() {
  redirect("/student?view=portrait");
}
