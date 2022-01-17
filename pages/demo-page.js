import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from "web3modal"
import {
  nftmarketaddress, nftaddress
} from '../config'

import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
export default function CreatorDashboard() {
	const [nfts, setNfts] = useState([])
  const [sold, setSold] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(() => {
    loadNFTs()
  }, [])
  async function loadNFTs() {
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    })
    const connection = await web3Modal.connect()
		console.log(connection.selectedAddress, 'connection')
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
		const data = await marketContract.fetchMyNFTs()
    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        sold: i.sold,
        image: meta.data.image,
      }
			console.log(item, 'items')
      return item
    }))
    /* create a filtered array of items that have been sold */
    const soldItems = items.filter(i => i.sold)
    setSold(soldItems)
    setNfts(items)
    setLoadingState('loaded') 
  }
    return(
			<div style={{padding: '24px'}}>
				{nfts.length === 0 &&
					<div> This content is restricted. You can not see the image.</div>
				}
				{nfts.length > 0 && 
					<div >
						<div style={{fontSize: '20px'}}>Now You can access the content of the page</div>
						<img style={{width: '800px', height: '400px', marginTop: '25px'}} src="https://ipfs.infura.io/ipfs/QmUFjRjYJ8GhiRLGV2P32bVjj7Qv1pv1V3VZP9Eyf4zgjL" alt='dummy' />
					</div>
				}
			</div>
    )
}