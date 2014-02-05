/** @jsx React.DOM */
var Link = React.createClass({
    getInitialState: function() {
        return {edit: 'none'};
    },
    deleteObj: function() {
        this.props.onDelete(this.props.key);
    },
    editObj: function() {
        console.log('edit');
    },
    render: function() {
        var pub_date = moment(this.props.pub_date).calendar();
        var uri_obj = parseUri(this.props.url);
        var domain = uri_obj.host;
        var domain_url = uri_obj.protocol + '://' + domain;

        return (
            <div ref="item" data-id={this.props.id}
                 className="row link-block well">
                <div className="col-md-11">
                    <div>
                        <a href={this.props.url} className="link-title">
                            <span>{this.props.title}</span>
                        </a>
                        <a href={domain_url} className="link-title">{domain}</a>
                    </div>
                    <div>
                        {this.props.tags} <span className="pull-right">{pub_date}</span>
                    </div>
                </div>
                <div className="col-md-1">
                    <div>
                        <a href="#edit" onClick={this.saveObj}>
                            <span className="glyphicon glyphicon-hdd"></span>
                        </a>
                        <a href="#edit" onClick={this.editObj}>
                            <span className="glyphicon glyphicon-pencil edit-obj"></span>
                        </a>
                        <a href="#delete" onClick={this.deleteObj}>
                            <span className="glyphicon glyphicon-remove delete-obj"></span>
                        </a>
                    </div>
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
});

var LinkForm = React.createClass({
    getInitialState: function() {
        return {add: 'none'};
    },
    toggleAdd: function() {
        var add = 'none';

        if(this.state.add == 'none') {
            add = 'block';
        }

        this.setState({add: add});
    },

    addObj: function() {
        var url = this.refs.url.getDOMNode().value.trim();
        this.props.onSubmit(url);
    },

    render: function() {
        return (
            <div className="link-add">
                <a href="#add" onClick={this.toggleAdd}>Add</a>

                <div style={{display: this.state.add}}>
                    <input type="text" ref="url" />
                    <input type="button" onClick={this.addObj} value="add" />
                </div>
            </div>
        )
    }
});

var LinkList = React.createClass({
    render: function() {
        var onDelete = this.props.onDelete;
        var links = this.props.data.map(function(link) {
            var tags = link.tags.map(function(tag) {
                return <Tag slug={tag.slug} name={tag.name} key={tag.id} />;
            });

            return <Link url={link.url} title={link.title} key={link.id}
                         tags={tags} pub_date={link.pub_date}
                         onDelete={onDelete}
                         />;
        });

        return (
            <div className="link-list">
                {links}
            </div>
        )
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
            headers: {'X-CSRFToken': $.cookie('csrftoken')},
            success: function(data) {}
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

var LinkSearch = React.createClass({
    onSearch: function() {
        var query = this.refs.query.getDOMNode().value.trim();
        this.props.handleSearch(query);
    },
    render: function() {
        return (
            <div>
                <input type="search" placeholder="Search" ref="query" />
                <input type="button" value="Search" onClick={this.onSearch}/>
            </div>
        );
    }
});

var LinkBox = React.createClass({
    handleAddLink: function(url) {
        var links = this.state.data;

        data = {url: url};

        $.ajax({
            type: 'POST',
            url: this.props.url,
            data: data,
            headers: {'X-CSRFToken': $.cookie('csrftoken')},
            success: function(data) {
                var newLinks = links.concat([data]);
                this.setState(newLinks);
            }.bind(this)
        });
    },
    deleteObj: function(data_id) {
        var links = this.state.data;
        var newlinks = links.filter(function(elem) {
            return elem.id != data_id;
        });

        this.setState({data: newlinks});

        $.ajax({
            type: 'DELETE',
            url: '/api/links/' + data_id + '/',
            success: function() {}.bind(this),
            headers: {'X-CSRFToken': $.cookie('csrftoken')}
        });
    },
    loadLinksFromServer: function(query) {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            data: {query: query},
            success: function(data) {
              this.setState({data: data});
            }.bind(this)
        });
    },
    searchLinks: function(query) {
        this.loadLinksFromServer(query);
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

                <LinkForm url={this.props.url} onSubmit={this.handleAddLink} />

                <LinkSearch handleSearch={this.searchLinks} />

                <LinkList data={this.state.data} onDelete={this.deleteObj} />
            </div>
        )
    }
});

React.renderComponent(
  <LinkBox url={'/api/links/'}/>,
  document.getElementById('content')
);
