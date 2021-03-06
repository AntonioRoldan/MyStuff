import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { Button } from 'react-bootstrap'
import './AdvertPage.css'
import cookies from '../../cookies'

function displayPrice(x) {
  return `£${x / 100}`
}

class AdvertPage extends Component {
  state = {
    poster: {},
    session: '',
    userEmail: '',
    userId: '',
    advertId: '',
    advert: null,
    error: false,
  }

  getLoginInfo = () => {
    this.setState(
      {
        session: cookies.getCookie('session'),
      },
      () => {
        axios
          .get('http://localhost:4000/who-am-i', {
            headers: {
              Authorization: this.state.session,
            },
          })
          .then(res => {
            this.setState({
              userEmail: res.data,
            })
          })
      }
    )
  }

  addToWishlist = () => {
    axios
      .post('http://localhost:4000/add-wishlist', {
        advertId: this.state.advertId,
        userEmail: this.state.userEmail,
      })
      .then(res => {
        console.log('Advert was added to your wishlist')
      })
      .catch(() => {
        this.setState({ error: true })
      })
  }

  getPoster = posterEmail => {
    axios
      .get(`http://localhost:4000/poster/${posterEmail}`)
      .then(res => this.setState({ poster: res.data }))
      .catch(() => this.setState({ error: true }))
  }

  componentDidMount() {
    this.setState(
      {
        advertId: this.props.match.params.id,
      },
      () => {
        axios
          .get(`http://localhost:4000/getAdvert/${this.state.advertId}`)
          .then(res => {
            this.setState(
              {
                advert: res.data,
              },
              () => {
                this.getPoster(this.state.advert.userEmail)
              }
            )
          })
          .catch(() => {
            this.setState({ error: true })
          })
      }
    )
    this.getLoginInfo()
  }

  renderAdvert = (postedByUser, advert, price) => {
    const { poster } = this.state
    if (postedByUser) {
      return (
        <div>
          <img
            src={advert.imgurl || 'https://via.placeholder.com/200x200'}
            alt="item"
            class="advertimg"
          />
          <div className="details">
            <h2>{advert.title}</h2>
            <p>Location: {advert.postcode}</p>
            <p>{advert.description}</p>
            <p>Category: {advert.category}</p>
            <p>Item condition: {advert.condition}</p>
            <p>Price: {displayPrice(price)}</p>
            <p>Views: {advert.views}</p>
          </div>
          <Button type="submit" id="favourite">
            Delete advert
          </Button>
        </div>
      )
    }
    return (
      <div>
        <img
          src={advert.imgurl || 'https://via.placeholder.com/200x200'}
          alt="item"
          className="advertimg"
        />
        <div className="details">
          <h2>{advert.title}</h2>
          <p>
            Posted by: <Link to={`/users/${poster.id}`}>{poster.username}</Link>
          </p>
          <p>Location: {advert.postcode}</p>
          <p>{advert.description}</p>
          <p>Category: {advert.category}</p>
          <p>Item condition: {advert.condition}</p>
          <p>Price: {displayPrice(price)}</p>
          <p>Views: {advert.views}</p>
        </div>
        <Button type="submit" id="contact">
          <Link to={`/chat/${poster.id}`}>Contact poster</Link>
        </Button>
        <Button type="submit" id="favourite" onClick={this.addToWishlist}>
          Add this advert to my favourites
        </Button>
      </div>
    )
  }

  render() {
    if (this.state.error) {
      return (
        <div>
          <h2>Error!</h2>
          <p>I'm afraid this advert has been misplaced</p>
        </div>
      )
    }
    const advert = this.state.advert
    if (advert) {
      if (advert.userEmail === this.state.userEmail) {
        return this.renderAdvert(true, advert, advert.price)
      } else {
        return this.renderAdvert(false, advert, advert.price)
      }
    } else {
      return <p>loading...</p>
    }
  }
}

export default AdvertPage
