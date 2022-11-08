import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'

export const TopBar = () => {
  return (
    <div className="topbar">
      <div className="container">
        <Link href="/">
          <a>
            <span className="unep">
              <Image src="/unep.svg" alt="UNEP" width={62} height={46} />
            </span>
            <Image src="/cobsea.svg" alt="COBSEA" width={162} height={42} />
          </a>
        </Link>
        <nav>
          <Link href="/knowledge-library">Knowledge library</Link>
          &nbsp;|&nbsp;
          <span>Research database</span>
        </nav>
      </div>
    </div>
  )
}

export default function Home() {
	return (
		<div>
			<Head>
				<title>COBSEA</title>
				{/* <meta name="description" content="Generated by create next app" /> */}
				{/* <link rel="icon" href="/favicon.ico" /> */}
			</Head>
			<div id='landing'>
				<div style={{ display: 'flex', flexDirection: 'column' }}>
					<Image src='/cobsea.svg' alt='COBSEA' width={162} height={42} />
					<div style={{ display: 'flex', marginTop: 15 }}>
						<Link href='/knowledge-library'>Knowledge lib</Link>&nbsp;| Research
						database
					</div>
				</div>
			</div>
		</div>
	);
}
