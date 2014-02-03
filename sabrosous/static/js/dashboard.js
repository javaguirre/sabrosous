/** @jsx React.DOM */
var Link = React.createClass({
    render: function() {
        return (
            <li>{this.props.title}</li>
        )
    }
});

var LinkList = React.createClass({
    render: function() {
        var links = this.props.data.map(function(link) {
            return <Link url={link.url} title={link.title} key={link.id} />;
        });

        return (
            <div>
                <ul>
                    {links}
                </ul>
            </div>
        )
    }
});

var LinkForm = React.createClass({
    getInitialState: function() {
        return {edit: 'none'};
    },
    render: function() {
        return (
            <div>
            </div>
        );
    }
});

var LinkImport = React.createClass({
    getInitialState: function() {
        return {edit: 'none'};
    },
    importLink: function(e) {
        e.preventDefault();
        var data = new FormData();
        data.append('file', this.refs.file.getDOMNode().files[0]);

        $.ajax({
            type: 'POST',
            enctype: 'multipart/form-data',
            url: '/import/',
            contentType: false,
            processData: false,
            data: data,
            headers: {
                'X-CSRFToken': $.cookie('csrftoken')},
            success: function(data) {
                console.log('Goed!');
            }
        });
        return false;
    },

    toggleImporter: function(event) {
        var edit = 'none';

        if(this.state.edit == 'none') {
            edit = 'block';
        }

        this.setState({edit: edit});
    },

    render: function() {
        return (
            <div>
                <a href="#import" onClick={this.toggleImporter}>Import from Delicious</a>

                <form style={{display: this.state.edit}}>
                    <input ref="file" type="file" name="file" />
                    <a href="#import" onClick={this.importLink} className="btn btn-primary">Import</a>
                </form>
            </div>
        );
    }
});

var LinkBox = React.createClass({
    search: function(query) {
        if(query === "") {
            return this;
        }

        var pattern = new RegExp(query, 'gi');
        objs = _(this.filter(function(data) {
            return pattern.test(data.get('title'));
        }));

        return objs;
    },

    loadLinksFromServer: function() {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            success: function(data) {
              this.setState({data: data});
            }.bind(this)
        });
    },
    getInitialState: function() {
        return {data: []};
    },
    componentWillMount: function() {
        this.loadLinksFromServer();
    },
    render: function() {
        return (
            <div>
                <h3>Links</h3>
                <LinkImport />
                <LinkList data={this.state.data} />
            </div>
        )
    }
});

React.renderComponent(
  <LinkBox url={'/api/links/'}/>,
  document.getElementById('content')
);
