var React = require('react');
var Alert = require('react-bootstrap').Alert;

var AlertUI = React.createClass({
  render: function(){
    return (
      <div>
        <Alert bsStyle='warning'>
    		<strong>Holy guacamole!</strong> Best check yo self, you're not looking too good.
  		</Alert>
      </div>
    )
  }
});


module.exports = AlertUI;
