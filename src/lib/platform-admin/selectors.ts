import { platformDefinitions } from "./definitions";

export function findPlatformPage(platformId: string, pageId: string) {
  const platform = platformDefinitions.find((item) => item.id === platformId);
  const group = platform?.groups.find((item) => item.pages.some((child) => child.id === pageId));
  return {
    platform,
    group,
    page: group?.pages.find((child) => child.id === pageId),
  };
}
