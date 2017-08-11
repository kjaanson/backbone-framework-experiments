
import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore';
import Store from 'backbone.localstorage';
import Marionette from 'backbone.marionette';

var catapp = {};




catapp.AngryCat = Backbone.Model.extend({});

catapp.AngryCats = Backbone.Collection.extend({
  model: catapp.AngryCat
});

catapp.AngryCatView = Marionette.ItemView.extend({
  template: "#angry-template",
  tagName: 'tr',
  className: 'angry_cat'
});


catapp.AngryCatsView = Marionette.CompositeView.extend({
  template: "#cats-table-template",
  tagName: "table",
  id: "angry_cats",
  className: "table-striped table-bordered",
  itemView: catapp.AngryCatView,

  appendHtml: function (collectionView, itemView) {

    collectionView.$('tbody').append(itemView.el);
  },

});


catapp.CatApp = new Marionette.Application();
catapp.CatApp.addRegions({
  mainRegion:"#catapp"
})

catapp.CatApp.addInitializer(
  function(options) {
    var angryCatsView = new catapp.AngryCatsView({
      collection: options.cats
    });
    catapp.CatApp.mainRegion.show(angryCatsView);
  }
);



$(document).ready(function(){
  var cats = new catapp.AngryCats([
    { name: 'Wet Cat' },
    { name: 'Bitey Cat' },
    { name: 'Surprised Cat' },
    { name: 'Surprised Dog' }
  ]);

  catapp.CatApp.start({cats: cats});
});

export default catapp;
