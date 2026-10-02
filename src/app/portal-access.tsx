import { Redirect } from 'expo-router';

// Preserve existing bookmarks and use the app's normal entry flow.
export default function PortalAccessScreen() {
  return <Redirect href="/" />;
}
