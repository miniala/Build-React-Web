var React = require('react');

var Child = React.createClass({
  render: function(){
    return (
      <div>
        and change this the wo X<b>{this.props.name}</b>.
      </div>
    )
  }
});

module.exports = Child;
