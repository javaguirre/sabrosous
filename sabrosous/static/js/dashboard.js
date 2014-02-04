/** @jsx React.DOM */
var Link = React.createClass({
    render: function() {
        var pub_date = moment(this.props.pub_date).calendar();
        var domain = parseUri(this.props.url).host;

        return (
            <div className="row link-block well">
                <div>
                    <a href={this.props.url} className="link-title">{this.props.title}</a>
                    <a href={domain} className="link-title">{domain}</a>
                </div>
                <div>
                    {this.props.tags} <span className="pull-right">{pub_date}</span>
                </div>
            </div>
        )
    }
});

var Tag = React.createClass({
    render: function() {
        var hash = '#' + this.props.slug;

        return (
            <a href={hash} className="tag small">{this.props.name}</a>
        )
    }
})

var LinkList = React.createClass({
    render: function() {
        var links = this.props.data.map(function(link) {
            var tags = link.tags.map(function(tag) {
                return <Tag slug={tag.slug} name={tag.name} />;
            });

            return <Link url={link.url} title={link.title} key={link.id}
                         tags={tags} pub_date={link.pub_date}
                         />;
        });

        return (
            <div className="link-list">
                {links}
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
