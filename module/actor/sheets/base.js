import LexArcanaItem from "../../item/entity.js";
import {LexArcana} from '../../config.js';
import {System} from '../../config.js';

/**
 * Extend the basic ActorSheet class to suppose system-specific logic and functionality.
 * This sheet is an Abstract layer which is not used.
 * @extends {ActorSheet}
 */
export default class LexArcanaActorSheet extends ActorSheet
{
    constructor(...args)
    {
        super(...args);

        /**
         * Track the set of item filters which are applied
         * @type {Set}
         */
        this._filters = {
            inventory: new Set()
        };
    }

    /* -------------------------------------------- */

    /** @override */
    static get defaultOptions()
    {
        return mergeObject(super.defaultOptions, {
            scrollY: [
                ".inventory .inventory-list"
            ],
            tabs: [{navSelector: ".tabs", contentSelector: ".sheet-body", initial: "description"}]
        });
    }

    /** @override */
    getData()
    {
        // Basic data
        let isOwner = this.entity.owner;
        const data = {
            owner: isOwner,
            limited: this.entity.limited,
            options: this.options,
            editable: this.isEditable,
            cssClass: isOwner ? "editable" : "locked",
            isCharacter: !this.entity.data.data.attributes.npc,
            isNPC: this.entity.data.data.attributes.npc,
            isGM: game.user.isGM,
            config: CONFIG.LexArcana
        };
        // The Actor and its Items
        data.actor = duplicate(this.actor.data);
        data.data = data.actor.data;

        // Ability Scores
        for ( let [k, v] of Object.entries(data.actor.data.peritiae))
        {
            v.label = CONFIG.LexArcana.Peritia[k];
        }
        // Return data to the sheet
        return data;
    }

    /* -------------------------------------------- */

    /** @override */
    get template()
    {
        if (!game.user.isGM && this.actor.limited) return System.Path + "/templates/actors/limited-sheet.html";
        return System.Path + `/templates/actors/${this.actor.data.type}-sheet.html`;
    }

    /* -------------------------------------------- */
    /*  Event Listeners and Handlers
    /* -------------------------------------------- */
  
    /**
     * Activate event listeners using the prepared sheet HTML
     * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
     */
    activateListeners(html)
    {
        super.activateListeners(html);
        if ( !this.options.editable ) return;
  
        // hide/show defaultRoll
        html.find('.default-roll-input-toggle').click(this._onDefaultRoll.bind(this));
        html.find('.default-roll-input-toggle').contextmenu(this._onToggleDefaultRoll.bind(this));
        
        html.find('.rollable-1d').click(this._onRoll1D.bind(this));
        html.find('.rollable-2d').click(this._onRoll2D.bind(this));
        html.find('.rollable-3d').click(this._onRoll3D.bind(this));
    }

    /* -------------------------------------------- */
  
    /**
     * Handle default roll peritia
     * @param {Event} event   The triggering click event
     * @private
     */
     _onDefaultRoll(event)
    {
        event.preventDefault();
        let defaultRollElement = event.currentTarget.nextElementSibling;
        let defaultRollExpression = defaultRollElement.querySelector(".default-roll-expression").value;
        return this.actor.roll(defaultRollExpression);
    }

    /* -------------------------------------------- */
  
    /**
     * Handle default roll peritia
     * @param {Event} event   The triggering click event
     * @private
     */
     _onRoll1D(event, numDice)
    {
        event.preventDefault();
        return this.actor.rollND(event.currentTarget.dataset, 1);
    }
    _onRoll2D(event, numDice)
    {
        event.preventDefault();
        return this.actor.rollND(event.currentTarget.dataset, 2);
    }
    _onRoll3D(event, numDice)
    {
        event.preventDefault();
        return this.actor.rollND(event.currentTarget.dataset, 3);
    }

    /* -------------------------------------------- */
  
    /**
     * Handle toggling the state of default roll peritia
     * @param {Event} event   The triggering click event
     * @private
     */
     _onToggleDefaultRoll(event)
    {
        event.preventDefault();
        let showHide = event.currentTarget.nextElementSibling;
        showHide.style.display = showHide.style.display === 'block'?'none':'block';
        return;
    }
}