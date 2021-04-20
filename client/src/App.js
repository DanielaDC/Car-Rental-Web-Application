import React from 'react';
import './App.css';

import { BrowserRouter as Router } from 'react-router-dom';
import Link from 'react-router-dom/Link';
import Switch from 'react-router-dom/Switch';
import Route from 'react-router-dom/Route';
import Redirect from 'react-router-dom/Redirect';

import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import moment from 'moment';
import Image from 'react-bootstrap/Image'
import API from './api/API';
import Popover from 'react-bootstrap/Popover'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'

import 'bootstrap/dist/css/bootstrap.min.css';
import './customStyle.css';
import validator from 'validator';

function App() {

  return (
    <div className="App">
      <Router>
        <RentalApp></RentalApp>
      </Router>
    </div>
  )
}

class RentalApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = { username: "" };
    this.setUserName = this.setUserName.bind(this);
  }

  setUserName(username) {
    this.setState({ username: username });
  }

  logout = () => {
    API.logout().then(() => {
      this.setState();
    });
  }

  render() {
    return <>

      <Switch>
        <Route exact path='/Catalogue'>
          <CataloguePage></CataloguePage>
        </Route>
        <Route exact path='/Login'>
          <LoginPage setUserName={this.setUserName}></LoginPage>
        </Route>
        <Route exact path='/MyRentals'>
          <MyRentalsPage username={this.state.username}></MyRentalsPage>
        </Route>
        <Route exact path='/NewRental'>
          <NewRentalPage username={this.state.username}></NewRentalPage>
        </Route>
        <Route>
          <Redirect to='/Catalogue' />
        </Route>

      </Switch>
    </>;
  }
}

class CataloguePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { categoryFilters: [], brandFilters: [], vehicles: [], brands: [], doLogin: false };
  }

  setCategory = (category) => {
    let catFilters = [...this.state.categoryFilters];
    if (catFilters.includes(category))
      catFilters.splice(catFilters.indexOf(category), 1);
    else
      catFilters.push(category);
    API.getVehicles(catFilters, this.state.brandFilters).then((vehicles) => {
      this.setState({ vehicles: vehicles, categoryFilters: catFilters });
    })
  }

  setBrand = (brand) => {
    let braFilters = [...this.state.brandFilters];
    if (braFilters.includes(brand))
      braFilters.splice(braFilters.indexOf(brand), 1);
    else
      braFilters.push(brand);

    API.getVehicles(this.state.categoryFilters, braFilters).then((vehicles) => {
      console.log(vehicles);
      this.setState({ vehicles: vehicles, brandFilters: braFilters });
    })
  }

  componentDidMount() {
    API.getVehicles(this.state.categoryFilters, this.state.brandFilters).then((vehicles) => this.setState({ vehicles: vehicles }))
    API.getBrands().then((brands) => {
      this.setState({ brands: brands });
    })
  }
  render() {
    return <>
      {this.state.doLogin ? <Redirect to={"/Login"}></Redirect> : undefined}
      <Container fluid id="c1">
        <Row>
          <Col md={12}>
            <Navbar bg="dark" variant="dark" id="n1">
              <Navbar.Brand>RentalApp</Navbar.Brand>
              <Nav className="mr-auto">
                <Nav.Link>Home</Nav.Link>
              </Nav>
              <Form inline>
                <Nav.Link onClick={(event) => this.setState({ doLogin: true })}>Login</Nav.Link>
              </Form>
            </Navbar></Col>
        </Row>
        <Row>
          <Col md={4}>
            <h4>Select Category</h4>
            <ButtonGroup aria-label="Basic example">
              <Button variant="outline-primary" onClick={event => { this.setCategory("A"); event.target.classList.toggle("lightOnb"); }}>A</Button>
              <Button variant="outline-primary" onClick={event => { this.setCategory("B"); event.target.classList.toggle("lightOnb"); }}>B</Button>
              <Button variant="outline-primary" onClick={event => { this.setCategory("C"); event.target.classList.toggle("lightOnb"); }}>C</Button>
              <Button variant="outline-primary" onClick={event => { this.setCategory("D"); event.target.classList.toggle("lightOnb"); }}>D</Button>
              <Button variant="outline-primary" onClick={event => { this.setCategory("E"); event.target.classList.toggle("lightOnb"); }}>E</Button>
            </ButtonGroup>
            <br></br>
            <br></br>
            <h4>Select Brand</h4>
            <ButtonGroup vertical>
              {this.state.brands.map((brand) => (
                <Button variant="outline-success" onClick={event => { this.setBrand(brand); event.target.classList.toggle("lightOn"); }}>{brand}</Button>
              )
              )}
            </ButtonGroup>
          </Col>

          <Col md={8}>
            <h3>Here are your results!</h3>
            <h5>Login for book one of our fantastic car</h5>
            <br></br>
            <Table responsive>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Model</th>
                </tr>
              </thead>
              <tbody>{this.state.vehicles.map((vehicle, idx) =>
                <tr>
                  <td>{vehicle.category}</td>
                  <td>{vehicle.brand}</td>
                  <td>{vehicle.model}</td>
                </tr>
              )}</tbody>
              
            </Table>
          </Col>
        </Row>
      </Container>
    </>
  }
}

class LoginPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { email: '', password: '', submitted: false, logged: false, home: false };
  }

  onChangeMail = (value) => {
    this.setState({ email: value });
  };

  onChangePassword = (value) => {
    this.setState({ password: value });
  };


  login = () => {
    API.login(this.state.email, this.state.password).then(
      (user) => {
        this.props.setUserName(user.name);
        this.setState({ logged: true });
      }
    ).catch(
      (errorObj) => {
        console.log("Error");
      }
    );
  }

  render() {
    let popover4 = <Popover id="popover-basic">
      <Popover.Title as="h3">{this.state.logged ? "Mail and password are correct" : "Ops! Invalid username or password"}</Popover.Title>
    </Popover>

    if (this.state.submitted)
      return <Redirect to='/' />;
    return <>
      {this.state.home ? <Redirect to={"/Catalogue"}></Redirect> : undefined}
      {this.state.logged ? <Redirect to={"/NewRental"}></Redirect> : undefined}
      <Container fluid id="c1">
        <Row>
          <Col md={12}>
            <Navbar bg="dark" variant="dark" id="n1">
              <Navbar.Brand>RentalApp</Navbar.Brand>
              <Nav className="mr-auto">
                <Nav.Link onClick={(event) => this.setState({ home: true })}>Home</Nav.Link>
              </Nav>
              <Form inline>
                <Nav.Link onClick={(event) => this.setState({ doLogin: true })}>Login</Nav.Link>
              </Form>
            </Navbar></Col>
        </Row>
        <Row>
          <Col md={2}></Col>
          <Col md={8}>
            <h2 className="ui teal image header">
              <svg className="bi bi-check-all" width="30" height="30" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M12.354 3.646a.5.5 0 010 .708l-7 7a.5.5 0 01-.708 0l-3.5-3.5a.5.5 0 11.708-.708L5 10.293l6.646-6.647a.5.5 0 01.708 0z" clipRule="evenodd" />
                <path d="M6.25 8.043l-.896-.897a.5.5 0 10-.708.708l.897.896.707-.707zm1 2.414l.896.897a.5.5 0 00.708 0l7-7a.5.5 0 00-.708-.708L8.5 10.293l-.543-.543-.707.707z" />
              </svg>
              <div className="content">
                Log-in to your account
                            </div>
            </h2>

            <Form method="POST" onSubmit={(event) => { event.preventDefault(); this.login(); }}>
              <Form.Group controlId="email">
                <Form.Label>E-mail</Form.Label>
                <Form.Control type="email" name="email" placeholder="E-mail" value={this.state.email} onChange={(ev) => this.onChangeMail(ev.target.value)} required autoFocus />
              </Form.Group>

              <Form.Group controlId="password">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" name="password" placeholder="Password" value={this.state.password} onChange={(ev) => this.onChangePassword(ev.target.value)} required />
              </Form.Group>
              <OverlayTrigger trigger="click" placement="bottom" rootClose overlay={popover4}>
                <Button variant="primary" onClick={(event) => {
                  if ((this.state.email.includes("@")) && (this.state.email.includes(".")))
                    this.login();
                }}>Login</Button>
              </OverlayTrigger>
            </Form>
          </Col>
        </Row>
      </Container>
    </>
  }
}

class MyRentalsPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { logout: false, newrent: false, delete: true, pastRentals: [], futureRentals: [] }
  }

  deleteRental = (rentalID, startDate) => {
    if (moment(startDate).isAfter(moment())) {
      let futureRentals = [...this.state.futureRentals];
      futureRentals.splice(futureRentals.findIndex(rental => rental.rentalID === rentalID), 1);
      API.deleteRental(rentalID)
      this.setState({ futureRentals: futureRentals })
    }
  }

  componentDidMount() {
    API.rentals("past").then((pastRentals) => this.setState({ pastRentals: pastRentals }))
    API.rentals("future").then((futureRentals) => this.setState({ futureRentals: futureRentals }))
    API.isAuthenticated().then((user) => this.setState({ user: user }))
  }

  render() {
    const popover3 = <Popover id="popover-basic">
      <Popover.Title as="h3">You can't delete me!</Popover.Title>
      <Popover.Content>Sorry, this rental has already started</Popover.Content>
    </Popover>
    return <>
      {this.state.logout ? <Redirect to={"/Catalogue"}></Redirect> : undefined}
      {this.state.newrent ? <Redirect to={"/NewRental"}></Redirect> : undefined}
      <Container fluid id="c1">
        <Row>
          <Col md={12}>
            <Navbar bg="dark" variant="dark" id="n1">
              <Navbar.Brand>RentalApp</Navbar.Brand>
              <Nav className="mr-auto">
                <Nav.Link onClick={(event) => this.setState({ myrent: true })}>My Rentals</Nav.Link>
                <Nav.Link onClick={(event) => this.setState({ newrent: true })}>New Rental</Nav.Link>
              </Nav>
              <Navbar.Text>
                Signed in as: {this.props.username}
              </Navbar.Text>
              <Form inline>
                <Nav.Link onClick={(event) => this.setState({ logout: true })}>Logout</Nav.Link>
              </Form>
            </Navbar>
          </Col>
        </Row>
        <Jumbotron>
          <h2>Past rentals</h2>

          <Table responsive>
            <thead>
              <tr>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Vehicle Category</th>
                <th>Estimated Km</th>
                <th>Extra Drivers</th>
                <th>Extra Insurance</th>
                <th>Price payed</th>
              </tr>
            </thead>
            <tbody>
              {this.state.pastRentals.map((rental, idx) => (
                <tr>
                  <td>{rental.startDate}</td>
                  <td>{rental.endDate}</td>
                  <td>{rental.category}</td>
                  <td>{rental.estimatedKilometers}</td>
                  <td>{rental.nExtraDrivers}</td>
                  <td>{rental.extraInsurance ? "yes" : "no"}</td>
                  <td>{Number.parseFloat(rental.price).toFixed(2)}</td>
                </tr>
              )
              )}
            </tbody>
          </Table>
        </Jumbotron>
        <br />
        <Jumbotron>
          <h2>Future rentals</h2>
          <Table responsive>
            <thead>
              <tr>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Vehicle Category</th>
                <th>Estimated Km</th>
                <th>Extra Drivers</th>
                <th>Extra Insurance</th>
                <th>Price payed</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {this.state.futureRentals.map((rental, idx) => {
                return <tr>

                  <td>{rental.startDate}</td>
                  <td>{rental.endDate}</td>
                  <td>{rental.category}</td>
                  <td>{rental.estimatedKilometers}</td>
                  <td>{rental.nExtraDrivers}</td>
                  <td>{rental.extraInsurance ? "yes" : "no"}</td>
                  <td>{Number.parseFloat(rental.price).toFixed(2)}</td>
                  <OverlayTrigger trigger="click" placement="bottom" rootClose overlay={popover3}>


                    <td><Image src="bin.png" id="binimg" rounded
                      onClick={(event) => this.deleteRental(rental.rentalID, rental.startDate)} /></td>
                  </OverlayTrigger>
                </tr>
              })}

            </tbody>
          </Table>
        </Jumbotron>
      </Container>
    </>
  }
}

class NewRentalPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      logout: false, myrent: false, hasSent: false,
      category: "A", startDate: undefined, endDate: undefined, nExtraDrivers: 0, nEstimatedKm: 40, extraInsurance: false,
      price: 0, nAvailableVehicles: undefined, vehicleID: undefined,
      cardNumber: "", cardExpiration: "", cardCVV: "",
      cardNumberErr: false, cardExpirationErr: false, CVVerr: false,
      startDateErr: true, endDateErr: true, submitted: false, user: ""
    };
  }

  getResult() {
    if (this.state.startDateErr != true && this.state.endDateErr != true) {
      API.getReport(this.state.startDate, this.state.endDate, this.state.category, this.state.nExtraDrivers, this.state.nEstimatedKm, this.state.extraInsurance)
        .then((report) => {
          this.setState({ nAvailableVehicles: report.nAvailableVehicles, price: report.price, vehicleID: report.vehicleID })
        });
      this.setState({ hasSent: true });
    }
  }

  paymentcheck() {
    let error = false;

    if (validator.isCreditCard(this.state.cardNumber) == false) {
      this.setState({ cardNumberErr: true });
      error = true;
    } else this.setState({ cardNumberErr: false });

    if (moment('01/' + this.state.cardExpiration).isBefore(moment())) {
      this.setState({ cardExpirationErr: true });
      error = true;
    } else this.setState({ cardExpirationErr: false });

    if (this.state.cardCVV.length != 3) {
      this.setState({ CVVerr: true });
      error = true;
    } else this.setState({ CVVerr: false });


    if (error === false) {
      API.pay(this.state.vehicleID, this.state.startDate, this.state.endDate, this.state.category, this.state.nExtraDrivers,
        this.state.nEstimatedKm, this.state.extraInsurance, this.state.price, this.state.cardNumber, this.state.cardCVV)
    }
    this.setState({ submitted: true });
  }

  componentDidMount() {
    API.isAuthenticated().then((user) => this.setState({ user: user.name }))
  }

  render() {
    const popover1 = <Popover id="popover-basic">
      <Popover.Title as="h3">Payment result</Popover.Title>
      <Popover.Content>{this.state.cardNumberErr ? "Error in card number" : this.state.cardExpirationErr ? "Card expired or not inserted" : this.state.CVVerr ? "CVV wrong" : "Payment accepted!"}</Popover.Content>
    </Popover>
    const popover2 = <Popover id="popover-basic">
      <Popover.Title as="h3">{this.state.startDateErr || this.state.endDateErr ? "Error in data" : "Wonderful!"}</Popover.Title>
      <Popover.Content>{this.state.startDateErr ? "Please insert start date" : this.state.endDateErr ? "Please insert end date" : "Let's see what we have in the garage"}</Popover.Content>
    </Popover>

    if (this.state.submitted && !this.state.cardExpirationErr && !this.state.cardExpirationErr && !this.state.CVVerr)
      return <Redirect to='/MyRentals' />;

    return <>
      {this.state.logout ? <Redirect to={"/Catalogue"}></Redirect> : undefined}
      {this.state.myrent ? <Redirect to={"/MyRentals"}></Redirect> : undefined}
      <Container fluid id="c1">
        <Row>
          <Col md={12}>
            <Navbar bg="dark" variant="dark" id="n1">
              <Navbar.Brand>RentalApp</Navbar.Brand>
              <Nav className="mr-auto">
                <Nav.Link onClick={(event) => this.setState({ myrent: true })}>My Rentals</Nav.Link>
                <Nav.Link onClick={(event) => this.setState({ newrent: true })}>New Rental</Nav.Link>
              </Nav>
              <Form inline>
                <Navbar.Text>
                  Signed in as: {this.props.username}
                </Navbar.Text>
                <Nav.Link onClick={(event) => this.setState({ logout: true })}>Logout</Nav.Link>
              </Form>
            </Navbar>
          </Col>
        </Row>
        <Row>

          <Col bg="light" id="left-sidebar" className="collapse d-sm-block below-nav" >
            <Jumbotron>
              <Form.Group>
                <Form.Label>Start Date</Form.Label>
                <Col md={12}>
                  <Form.Control type="date" required max={this.state.endDate} min={moment().format("YYYY-MM-DD")} placeholder="Normal text" onChange={event => {
                    if (!moment(event.target.value).isValid() ||( this.state.endDate != undefined && (moment(event.target.value).isAfter(moment(this.state.endDate)))))
                      event.target.value = this.state.startDate;
                    else this.setState({ startDate: event.target.value, startDateErr: false });
                  }} /></Col>
                <br />
                <Form.Label>End Date</Form.Label>
                <Col md={12}>
                  <Form.Control type="date" required min={this.state.startDate} placeholder="Normal text" onChange={event => {
                    if (!moment(event.target.value).isValid() || moment(event.target.value).isBefore(moment(this.state.startDate))) event.target.value = this.state.startDate;
                    this.setState({ endDate: event.target.value, endDateErr: false })
                  }} /></Col>
                <br />
                <Form.Label>Vehicle Category</Form.Label>
                <Col md={12}>
                  <Form.Control as="select" onChange={event => {
                    this.setState({ category: event.target.value });
                  }}>
                    <option>A</option>
                    <option>B</option>
                    <option>C</option>
                    <option>D</option>
                    <option>E</option>
                  </Form.Control></Col>
                <br />
                <Form.Label>Number of extra drivers</Form.Label>
                <Col md={12}>
                  <Form.Control as="select" onClick={event => this.setState({ nExtraDrivers: Number.parseInt(event.target.value) })}>
                    <option>0</option>
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                    <option>5</option>
                  </Form.Control>
                </Col>
                <br />
                <Form.Label>Number of estimated kilometers</Form.Label>
                <Col md={12}>
                  <Form.Control as="select" onClick={event => {
                    if (event.target.value === "less than 50")
                      this.setState({ nEstimatedKm: 40 });
                    else if (event.target.value === "between 50 and 150")
                      this.setState({ nEstimatedKm: 60 });
                    else
                      this.setState({ nEstimatedKm: 160 });
                  }}>
                    <option>less than 50</option>
                    <option>between 50 and 150</option>
                    <option>more than 150</option>
                  </Form.Control>
                </Col>
                <br />
                <Form.Check
                  type="checkbox"
                  label="Need Extra Insurance"
                  onClick={event => this.setState({ extraInsurance: event.target.checked })}
                />
                <br />

                <OverlayTrigger trigger="click" placement="bottom" overlay={popover2} rootClose>
                  <Button variant="outline-primary" onClick={event => {
                    this.getResult()
                  }}>Search</Button>
                </OverlayTrigger>

              </Form.Group>
            </Jumbotron>
          </Col>

          {!this.state.hasSent ? undefined :
            <Col sm={6} className="below-nav">

              <Jumbotron>
                <Form.Label>Number of available vehicles <br /> {this.state.nAvailableVehicles}</Form.Label>
                <br />
                <Form.Label>Price proposed <br /> {this.state.nAvailableVehicles != 0 ? this.state.price.toFixed(2) : "Not available"}</Form.Label>
                <br />

              </Jumbotron>
              {this.state.nAvailableVehicles == 0 ? undefined :
                <Jumbotron>
                  <Form.Group>
                    <Form.Label>Credit Card Number</Form.Label>
                    <Col md={12}>
                      <Form.Control type="text" placeholder="Credit Card Number" onChange={event => { this.setState({ cardNumber: event.target.value }) }} />
                    </Col>
                    <br />
                    <Form.Label>Expiration Date</Form.Label>
                    <Col md={12}>
                      <Form.Control type="text" placeholder="Expiration Date" onChange={event => { this.setState({ cardExpiration: event.target.value }) }} />
                    </Col>
                    <br />
                    <Form.Label>CVV</Form.Label>
                    <Col md={12}>

                      <Form.Control type="text" placeholder="CVV" onChange={event => { this.setState({ cardCVV: event.target.value }) }} />
                      <br />


                      <OverlayTrigger trigger="click" placement="bottom" overlay={popover1} rootClose>
                        <Button variant="outline-primary" onClick={event => this.paymentcheck()}>Pay</Button>
                      </OverlayTrigger>

                    </Col>
                  </Form.Group>
                </Jumbotron>}
            </Col>
          }
        </Row>
      </Container>
    </>
  }
}

// Add a logout method


export default App;