import { Redirect } from 'expo-router';

// Keep old links working after moving point enrollment to Contact.
export default function CompanyApplicationScreen() {
  return <Redirect href={{ pathname: '/contact', params: { topic: 'point' } }} />;
}
