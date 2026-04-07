import dynamic from 'next/dynamic'
const Component = dynamic(() => import('../src/page-components/HomePage'))
export default function Page() { return <Component /> }
