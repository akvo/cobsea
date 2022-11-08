import Head from 'next/head';
import Link from 'next/link';
import MapIcn from '../../images/map-icn.svg'
import DataIcn from '../../images/data-icn.svg'
import FactIcn from '../../images/fact-icn.svg'
import './styles.scss';

const View = () => {
  return (
    <div>
			<Head>
				<title>COBSEA | Research Database</title>
			</Head>
			<div id="research-db">
        <nav>
          <div className="container">
            <Link href="/research/map">
              <a><MapIcn /> Map</a>
            </Link>
            <Link href="/research/data">
              <a><DataIcn /> Data & analytics</a>
            </Link>
            <Link href="/research/fact-sheet">
              <a><FactIcn /> Fact sheet</a>
            </Link>
          </div>
        </nav>
        <h1>research db</h1>
      </div>
    </div>
  )
}

export default View
