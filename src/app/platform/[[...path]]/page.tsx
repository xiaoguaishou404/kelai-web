import Platform from '@/components/enterprise/platform';
import './platform.css';
export default async function Page({params}:{params:Promise<{path?:string[]}>}) { const {path}=await params;return <Platform path={path}/>; }
