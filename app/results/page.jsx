import dynamic from 'next/dynamic'
const Component = dynamic(() => import('../../src/page-components/ResultsPage'))
export default function Page() { return <Component /> }
