/*
# MantisBT - a php based bugtracking system

# MantisBT is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 2 of the License, or
# (at your option) any later version.
#
# MantisBT is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with MantisBT.  If not, see <http://www.gnu.org/licenses/>.

# @author InitOS GmbH & Co.KG
#  @author Paul Götze <paul.goetze@initos.com>
*/

var baseURI = jQuery('script').context.baseURI.replace('%2F', '/');
var regex = /[^\/]+\/?$/;
var fileURI = baseURI.replace(regex, '')

var custom_box_script = fileURI + 'custom_box.php';
var default_box_script = fileURI + 'default_box.php';

var mainDialogWidth = 600;
var mainDialogHeight = 300;
var confirmDialogWidth = 300;
var confirmDialogHeigth = 200;

var maxHeight = 0;

//box size computation
var setBoxesSize = function() {	
	var boxes = jQuery('#dashboard-sortable li').filter(function() { 
		var box = jQuery(this);
		var display = box.css('display');
		return (display != 'none');
		});
			
	var h =  Math.max.apply(null, boxes.map(function() {
		return jQuery(this).height();
		}).get());
	
	boxes.each(function(index, element) {
		jQuery(element).height(h);
		});
	
	maxHeight = h;
};

//re-print bug box
var setProjectFilter = function(data) {
	var boxId = data['box_id'];
	var projectId = data['project_id'];
	
	var html = data['html'];
	var projectsHtml = html['projects'];
	var counterHtml = html['counter'];
	
	var boxElementId ="#dashboard-box-" + boxId;
	
	jQuery(boxElementId).find("tr:gt(0)").remove();
	jQuery(boxElementId +' tr:first').after(projectsHtml);
	jQuery('#description-box-' + boxId).html(counterHtml);
};

var setBoxVisibility = function(data) {	
	var boxId = data['box_id'];
	var visible = data['visible'];
	var linkHtml = data['link_show_html'];
	var boxElementId = '#dashboard-list-item-' + boxId;
	var listItemElementId = '#visibility-list-item-' + boxId;
	
	if(visible) {
		jQuery(boxElementId).fadeIn(function() {
			setBoxesSize();
		});
		
		jQuery(listItemElementId).remove();
		if(jQuery('.visibility-list-item').size() == 0 ) {
			jQuery('#dashboard-visibility-list-container').append(emptyVisibilityListText);
		}	
	} else {
		jQuery(boxElementId).fadeOut(function() {
			setBoxesSize();
			});
		
		jQuery('.visibility-list-item-filler').remove();
		jQuery('#dashboard-visibility-list-container').append(linkHtml);
	}
};

var saveBoxVisibility = function(form) {
	var actionUrl = default_box_script;
	var boxId = form.children('input[name=box_id]').val();
	var visible = form.children('input[name=visible]').val();
	var dataValues = {
			box_id : boxId,
			visible:  visible,
			action: 'visibility'
			};
	
	handleAJAXCall(actionUrl, dataValues, setBoxVisibility, handleBoxVisibilityError);
}

var createCustomBox = function() {
	var boxTitle = jQuery("#create-box-title").val();
	var boxFilterId = jQuery("#dashboard-new-box-dialog select[name=create-custom-filter-select]").val();
		
	var actionUrl = custom_box_script;
	var dataValues = { 
			title : boxTitle,
			filter_id: boxFilterId,
			action: 'create'
			};		
		
	handleAJAXCall(actionUrl, dataValues, afterCreateCustomBox, handleCreateCustomBoxError);
};

var saveCustomBoxVisibility = function(form) {
	var boxId = form.children("input[name=box_id]").val();
	var visible = form.children("input[name=visible]").val(); 
	var actionUrl = custom_box_script;
	
	var dataValues = {
			box_id: boxId,
			visible: visible,
			action: 'visibility'
			};
					   
	handleAJAXCall(actionUrl, dataValues, afterSetCustomBoxVisibility, handleBoxVisibilityError);
};

var afterSetCustomBoxVisibility = function(data) {
	if(data["saved"]){
		var boxId = data["box_id"];
		var visible = data["visible"];
		
		if(visible){
			jQuery("#dashboard-custom-box-" + boxId).parent("li").fadeIn();
			jQuery("#visibility-list-item-" + boxId).remove();
			
			if(jQuery('.visibility-list-item').size() == 0 ){
			jQuery('#dashboard-visibility-list-container').append(emptyVisibilityListText);
			}
		}
	}
};

var editCustomBox = function() {
	var boxTitle = jQuery("#edit-box-title").val();
	var boxFilterId = jQuery("#dashboard-edit-box-dialog select[name=edit-custom-filter-select]").val();
	
	var visible = jQuery("#edit-box-visible-checkbox").prop('checked') ? 1 : 0;	
	var boxId = jQuery("#delete-box-link input[name=box_id]").val();
		
	var actionUrl = custom_box_script;
	var dataValues = { title : boxTitle,
					   filter_id: boxFilterId,
					   visible: visible,
					   box_id: boxId,
					   action: 'edit'
					   };
		
	handleAJAXCall(actionUrl, dataValues, afterEditCustomBox, handleCreateCustomBoxError);
};

//call back function after  box creation
var afterCreateCustomBox = function(data){
	if(data["saved"] == true) {
		jQuery("#dashboard-sortable").append("<li>" + data["html"] + "</li>");
	} else {
		jQuery("#error-dialog").html(data["html"]).dialog("open");
	}
	
	// clear fields in dialog for next creation:
	jQuery("#dashboard-new-box-dialog input[name=box-title]").val("");
	jQuery("#dashboard-new-box-dialog select[name=create-custom-filter-select] option:eq(0)").attr("selected", "selected");
};

//call back function after  box editing
var afterEditCustomBox = function(data) {
	var boxId = data["box_id"];
	var linkHtml = data["link_show_html"];
	var visible = data["visible"];
	var html = data["html"];
	
	jQuery("#dashboard-custom-box-" + boxId).replaceWith(html);
	if(!visible) {
		var boxElementId = '#dashboard-custom-box-' + boxId;
		jQuery(boxElementId).parent("li").fadeOut();
		jQuery('.visibility-list-item-filler').remove();
		jQuery('#dashboard-visibility-list-container').append(linkHtml);
	}
};

var deleteCustomBox = function(data) {		
	var boxId = jQuery("#delete-box-link input[name=box_id]").val();
	var actionUrl = custom_box_script;
	var dataValues = { 
			box_id: boxId,
			action: 'delete'
			};
		
	handleAJAXCall(actionUrl, dataValues, afterDeleteCustomBox, handleCreateCustomBoxError);
};

//call back function after box deleting
var afterDeleteCustomBox = function(data) {
	jQuery("#dashboard-custom-box-" + data["box_id"]).parent("li").remove();
};


//error handling functions
//=====================================================
//TODO: implement some usefull information!

var handleProjectFilterError = function() {
	//console.log("handleProjectFilterError");
};

var handleBoxVisibilityError = function() {
	//console.log("handleBoxVisibilityError");
};

var handleBoxPositionError = function() {
	//console.log("handleBoxPositionError");
};

var handleCreateCustomBoxError = function() {
	//console.log("handleCreateCustomBoxError");
};
//======================================================


var handleAJAXCall = function(actionUrl, dataValues, successFunction, errorHandlingFunction) {	
	jQuery.ajax({
		type : 'POST',
		url : actionUrl,
		dataType : 'json',
		data : dataValues,
		success : function(data) {
			successFunction(data);
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {
			errorHandlingFunction();
			console.log(XMLHttpRequest + " - " + textStatus + ", Error: "  + errorThrown);
		}
	});
};

jQuery(document).ready(function() {
	
	setBoxesSize();
	//hide top menu select box:
	//jQuery('form[name=form_set_project]').hide();
	
	var sortableElement = jQuery('#dashboard-sortable');
	var newBoxButtons =  {};
	var editBoxButtons = {};
	var confirmBoxButtons = {};
	
	var close = function() {
		jQuery(this).dialog("close");
	};
	
	var create = function(){
		createCustomBox();
		jQuery(this).dialog("close");
	};
	
	var edit = function(){
		editCustomBox();
		jQuery(this).dialog("close");
	};
	
	newBoxButtons[pluginLangGet['save_box']] = create;
	newBoxButtons[pluginLangGet['cancel']] = close;
	
	editBoxButtons[pluginLangGet['save_box']] = edit;
	editBoxButtons[pluginLangGet['cancel']] = close;
	
	confirmBoxButtons[pluginLangGet['cancel']] = close;
	confirmBoxButtons[pluginLangGet['delete_box']] = function() {
		deleteCustomBox();
		jQuery(this).dialog("close");
		jQuery("#dashboard-edit-box-dialog").dialog("close");
	};
	
	jQuery("#dashboard-new-box-dialog").dialog({
		autoOpen: false,
		height: 300,
		width: 550,
		modal: true,
		close: function() {
      		//allFields.val("").removeClass("ui-state-error");
    	},
    	open: function () {
    		var boxName = pluginLangGet['untitled'];
            jQuery(this).find('#create-box-title').val(boxName).select();
        },
    	buttons: newBoxButtons
	});
	
	// edit dialog for custom boxes
	jQuery("#dashboard-edit-box-dialog").dialog({
		autoOpen: false,
		height: mainDialogHeight,
		width: mainDialogWidth,
		modal: true,
		close: function() {},
    	buttons: editBoxButtons
	});
	
	// confirmation dialog
	jQuery("#dialog-confirm").dialog({
		autoOpen: false,
	  	resizable: false,
	  	height:confirmDialogHeigth,
	  	width: confirmDialogWidth,
	  	modal: true,
	  	buttons: confirmBoxButtons
	});
  
	//info dialog
	jQuery("#info-dialog").dialog({
		autoOpen: false,
		height: mainDialogHeight,
		width: mainDialogWidth,
		modal: false,
		buttons: {
	    "OK": function() {
	      	jQuery(this).dialog("close");
	   		}
		}
	});
		
	//error dialog
	jQuery("#error-dialog").dialog({
		autoOpen: false,
		height: mainDialogHeight,
		width: mainDialogWidth,
		modal: false,
		buttons: {
	    "OK": function() {
	    	jQuery(this).dialog("close");
	      	}
		}
	});
	
	//create box dialog	
	jQuery('select[name=source_query_id]').change(function () {
      var filterId = jQuery('select[name=create-custom-filter-select]').val();
      jQuery('select[name=create-custom-filter-select]').val(filterId);
      });
	
	jQuery("#create-box").click(function() {
		jQuery( "#dashboard-new-box-dialog" ).dialog("open");
		});
  
  // delete box
	jQuery(".dashboard-delete").click(function() {
		jQuery( "#dialog-confirm" ).dialog("open");
		});
	
	//sortable
	sortableElement.sortable( {
		tolerance: 'pointer',
		handle: '.dashboard-drag',
		placeholder: 'dashboard-box-placeholder',
		stop: function(event, ui) {
			var forms = jQuery('.drag-box');
			var positionString = "";
			
			for(var i = 0; i < forms.length; i++) {
				var form = jQuery(forms[i]);
				var boxId = form.children('input[name=box_id]').val();
				var boxName = form.children('input[name=box_name]').val();
				var seperator = (i == forms.length-1) ? "" : ",";
				positionString += boxName + ":" + boxId + seperator;
			}			
						
			var actionUrl = custom_box_script;
			var dataValues = { box_positions : positionString,
								action: 'position'
							};
							   
			handleAJAXCall(actionUrl, dataValues, function(){} , handleBoxPositionError);
		},
		start: function(){
			jQuery('.dashboard-box-placeholder').height(maxHeight);
		}
	});
	
	sortableElement.disableSelection();
	
	//on select changed => sendajax request to update project filter 
	jQuery(document).on('change', 'select[name=project_id]', function() {
		var select = jQuery(this);
		var hiddenInput = select.parent('form').children('input[name=box_id]');
		
		if(hiddenInput.val()) {
			//show loader
			/*
			jQuery("#ajax_loader").ajaxStart(function() {
					jQuery(this).show(200);
				}).ajaxStop(function() {
					jQuery(this).hide();
			});
			*/
			
			var actionUrl = default_box_script;
			var dataValues = { project_id : select.val(),
							   box_id: hiddenInput.val(),
							   action: 'filter'
							};		
			
			handleAJAXCall(actionUrl, dataValues, setProjectFilter, handleProjectFilterError);
		}
	});
	
	
	//on hide clicked => hide box
	jQuery(document).on('click', 'form.hide-box', function() {
		saveBoxVisibility(jQuery(this));
	});
	
	//on show clicked => show box
	jQuery(document).on('click', 'form.show-box', function() {
		saveBoxVisibility(jQuery(this));
	});
	
	//on show custom box clicked => show custom box
	jQuery(document).on('click', 'form.show-custom-box', function() {
		saveCustomBoxVisibility(jQuery(this));
	});
	
	//on edit clicked => open custom box edit dialog with certain values
	jQuery(document).on('click', 'form.edit-box', function() {
		var form = jQuery(this);
		var boxId = form.children('input[name=box_id]').val();
		var boxTitle = form.children('input[name=orig_box_title]').val();
		var boxFilterId= form.children('input[name=orig_box_filter_id]').val();

		jQuery("#delete-box-link input[name=box_id]").val(boxId);
		jQuery("#edit-box-title").val(boxTitle);
		jQuery("#edit-custom-filter-select option[value=" + boxFilterId + "]").attr("selected", "selected");
		jQuery("#edit-box-visible-checkbox").prop("checked", true);
			
		jQuery("#dashboard-edit-box-dialog").dialog("open");
	});
});