import { ColorStyleStrict } from '@metoceanapi/wxtiles-leaflet';
import { WxGetColorSchemes, WxGetColorStyles } from '@metoceanapi/wxtiles-leaflet';
import { ColorStyleWeak } from '@metoceanapi/wxtiles-leaflet/dist/es/utils/wxtools';
import L from 'leaflet';

function createEl<K extends keyof HTMLElementTagNameMap>(container: HTMLElement, tag: K, params?: any): HTMLElementTagNameMap[K] {
	const el = document.createElement(tag);
	Object.assign(el, params);
	container?.appendChild(el);
	return el;
}

function JSONsort(o: any) {
	if (Array.isArray(o)) {
		return o.map(JSONsort);
	} else if (typeof o === 'object' && o !== null) {
		const keys = Object.keys(o)
			// .map((a) => a.toUpperCase())
			.sort((a, b) => {
				const aa = a.toUpperCase();
				const bb = b.toUpperCase();
				return aa == bb ? 0 : aa > bb ? 1 : -1;
			});
		return keys.reduce((a, k) => {
			a[k] = JSONsort(o[k]);
			return a;
		}, {});
	}
	return o;
}

export class Editor {
	onchange?: (style: ColorStyleStrict) => void;

	editorTextAreaEl: HTMLTextAreaElement;
	editorDivEl: HTMLDivElement;

	// inputs
	parentInput: HTMLInputElement; // string

	nameInput: HTMLInputElement; // string

	fillSelect: HTMLSelectElement; // string

	isolineColorSelect: HTMLSelectElement; // string
	isolineColorInput: HTMLInputElement;

	isolineTextInput: HTMLInputElement; // boolean

	vectorTypeSelect: HTMLSelectElement; // string

	vectorColorSelect: HTMLSelectElement; // string
	vectorColorInput: HTMLInputElement; // string

	vectorFactorInput: HTMLInputElement; // number

	streamLineColorSelect: HTMLSelectElement; // string
	streamLineColorInput: HTMLInputElement; // string

	streamLineSpeedFactorInput: HTMLInputElement; // number

	streamLineStaticInput: HTMLInputElement; // boolean

	showBelowMinInput: HTMLInputElement; // boolean

	showAboveMaxInput: HTMLInputElement; // boolean

	colorSchemeSelect: HTMLSelectElement; // string

	colorsInput: HTMLInputElement; // string[];

	colorMapInput: HTMLInputElement; // [number, string][];

	levelsInput: HTMLInputElement; // number[];

	blurRadiusInput: HTMLInputElement; // number

	addDegreesInput: HTMLInputElement; // number

	unitsInput: HTMLInputElement; // string

	extraUnitsInput: HTMLInputElement; // Units as { [name: string]: [string, number, ?number] };

	maskSelect: HTMLSelectElement; // string

	styleBase: ColorStyleStrict;

	constructor(map: L.Map, parent: HTMLElement, selectStyleEl: HTMLSelectElement, opts: { id: string; className: string }) {
		this.styleBase = WxGetColorStyles()['base'];

		// helpers
		const onwheel = L.DomEvent.stopPropagation;
		const onmousedown = (e: MouseEvent) => map.dragging.disable() && onwheel(e);
		const onmouseup = (e: MouseEvent) => map.dragging.enable() && onwheel(e);
		// Top level container
		const topmostDivEl = createEl(parent, 'div', { onclick: onwheel, ondblclick: onwheel, onwheel, onmousedown, onmouseup });
		// Button to open/close editor
		const customStyleButtonEl = createEl(topmostDivEl, 'button', {
			id: 'customStyleButton',
			style: 'height: 1.5em; background-color: gray',
			innerText: 'Custom Style',
		});
		// Editor container
		const customStyleHiddableDivEl = createEl(topmostDivEl, 'div', {
			id: 'customStyleDiv',
			style: 'display: none; border-color: black; border-style: solid; border-width: 2px; background-color: rgba(135, 206, 250, 0.8)',
		});
		customStyleButtonEl.addEventListener('click', () => {
			if (customStyleHiddableDivEl.style.display !== 'none') {
				customStyleHiddableDivEl.style.display = 'none';
				customStyleButtonEl.innerHTML = 'show Custom Style Editor';
			} else {
				customStyleHiddableDivEl.style.display = 'flex';
				customStyleButtonEl.innerHTML = 'update Custom Style & Hide';
				selectStyleEl.value = 'custom';
			}
		});

		// Text area to edit custom style
		this.editorTextAreaEl = createEl(customStyleHiddableDivEl, 'textarea', { id: 'customStyleTextArea', style: 'width: 20vw; height: 70vh' });
		this.editorTextAreaEl.addEventListener('change', () => this._onTextChange());
		// Editor container
		this.editorDivEl = createEl(customStyleHiddableDivEl, 'div', opts);
		// Helpers
		const addLabel = (id: string, br: boolean = true) => {
			createEl(this.editorDivEl, 'label', { htmlFor: id, id: id + 'Label', className: id + 'LabelClass', textContent: id.replace(/Input|Select$/i, '') });
			br && createEl(this.editorDivEl, 'br', {});
		};

		const addInput = ({
			id,
			type,
			min,
			max,
			step,
			onEvent = 'change',
			br = true,
		}: {
			id: string;
			type: string;
			onEvent?: string;
			min?: string;
			max?: string;
			step?: string;
			br?: boolean;
		}): HTMLInputElement => {
			const el = createEl(this.editorDivEl, 'input', { id, className: id + 'Class', type, min, max, step });
			onEvent !== 'none' && el.addEventListener(onEvent, () => this._onDivChange());
			addLabel(id, br);
			return el;
		};

		const addSelect = ({ id, opts, onEvent = 'change', br = true }: { id: string; opts: string[]; onEvent?: string; br?: boolean }) => {
			const el = createEl(this.editorDivEl, 'select', { id, className: id + 'Class' });
			onEvent !== 'none' && el.addEventListener(onEvent, () => this._onDivChange());
			opts.forEach((name) => el.options.add(createEl(el, 'option', { value: name, text: name })));
			addLabel(id, br);
			el.selectedIndex = 0;
			return el;
		};

		const addSelectInput = (id: string): [HTMLSelectElement, HTMLInputElement] => {
			const select = addSelect({ id: id + 'Select', br: false, opts: ['', 'inverted', 'fill', 'none', 'custom'] });
			const input = addInput({ id: id + 'Input', type: 'color', onEvent: 'none' });
			input.addEventListener('change', () => {
				select.value = 'custom';
				this._onDivChange();
			});
			return [select, input];
		};

		this.parentInput = addInput({ id: 'parentInput', type: 'text' });
		this.nameInput = addInput({ id: 'nameInput', type: 'text' });
		this.fillSelect = addSelect({ id: 'fillSelect', opts: ['', 'gradient', 'solid', 'none'] });

		[this.isolineColorSelect, this.isolineColorInput] = addSelectInput('isolineColor');
		this.isolineTextInput = addInput({ id: 'isolineTextInput', type: 'checkbox' });

		this.vectorFactorInput = addInput({ id: 'vectorFactorInput', type: 'number', min: '0.1', max: '10', step: '0.1' });
		this.vectorTypeSelect = addSelect({ id: 'vectorTypeSelect', opts: ['', 'arrows', 'barbs', 'none'] });
		[this.vectorColorSelect, this.vectorColorInput] = addSelectInput('vectorColor');
		[this.streamLineColorSelect, this.streamLineColorInput] = addSelectInput('streamLineColor');

		this.streamLineSpeedFactorInput = addInput({ id: 'streamLineSpeedFactorInput', type: 'number', min: '0.1', max: '10', step: '0.1' });
		this.streamLineStaticInput = addInput({ id: 'streamLineStaticInput', type: 'checkbox' });

		this.showBelowMinInput = addInput({ id: 'showBelowMinInput', type: 'checkbox' });
		this.showAboveMaxInput = addInput({ id: 'showAboveMaxInput', type: 'checkbox' });

		this.colorSchemeSelect = addSelect({ id: 'colorSchemeSelect', opts: Object.keys(WxGetColorSchemes()), onEvent: 'none' });
		this.colorSchemeSelect.addEventListener('change', () => {
			const style = this.getStyle();
			delete style.colors;
			this._setStyleToTextArea(style);
			this.colorsInput.value = '';
			this._onDivChange();
		});

		this.colorsInput = addInput({ id: 'colorsInput', type: 'text' }); // TODO:
		this.colorMapInput = addInput({ id: 'colorMapInput', type: 'text' }); // TODO:
		this.levelsInput = addInput({ id: 'levelsInput', type: 'text' }); // TODO:

		this.blurRadiusInput = addInput({ id: 'blurRadiusInput', type: 'range', onEvent: 'input', min: '0', max: '10', step: '1' });
		this.addDegreesInput = addInput({ id: 'addDegreesInput', type: 'number', min: '0', max: '360', step: '1' });
		this.unitsInput = addInput({ id: 'unitsInput', type: 'text' });
		this.extraUnitsInput = addInput({ id: 'extraUnitsInput', type: 'text' });
		this.maskSelect = addSelect({ id: 'maskSelect', opts: ['', 'none', 'sea', 'land'] });
	}

	getStyle(): ColorStyleStrict {
		// deep copy from _getStyleFromTextArea, _getStyleFromDiv not needed as affected  the textarea already
		return Object.assign({}, this.styleBase, this._getStyleFromTextArea() /*, this._getStyleFromDiv()*/);
	}

	setStyle(style: ColorStyleWeak): void {
		this._setStyleToTextArea(style);
		this._setStyleToDiv(style);
	}

	// this.editorTextAreaEl is always modifyed by StyleFromDiv at any changes in the div
	protected _getStyleFromTextArea(): ColorStyleWeak {
		try {
			return JSON.parse(this.editorTextAreaEl.value);
		} catch (e) {
			return e;
		}
	}

	protected _getStyleFromDiv(): ColorStyleWeak {
		const objFromValue = (field: string) => {
			try {
				return this[field].value ? JSON.parse(this[field].value) : undefined;
			} catch (e) {
				console.log(field, ' : parsing error: ', e);
				return undefined;
			}
		};

		const colorFromSelectInput = (select: HTMLSelectElement, input: HTMLInputElement): string | undefined => {
			if (select.value === 'custom') {
				return input.value;
			}
			return select.value || undefined;
		};

		const style: ColorStyleWeak = {
			parent: this.parentInput.value, // string;
			name: this.nameInput.value || undefined, //string;
			fill: this.fillSelect.value || undefined, //string;
			isolineColor: colorFromSelectInput(this.isolineColorSelect, this.isolineColorInput), //string;
			isolineText: this.isolineTextInput.checked, //boolean;
			vectorType: this.vectorTypeSelect.value || undefined, //string;
			vectorColor: colorFromSelectInput(this.vectorColorSelect, this.vectorColorInput), //string;
			vectorFactor: +this.vectorFactorInput.value, //number;
			streamLineColor: colorFromSelectInput(this.streamLineColorSelect, this.streamLineColorInput), //string;
			streamLineSpeedFactor: +this.streamLineSpeedFactorInput.value, //number;
			streamLineStatic: this.streamLineStaticInput.checked, //boolean;
			showBelowMin: this.showBelowMinInput.checked, //boolean;
			showAboveMax: this.showAboveMaxInput.checked, //boolean;
			colorScheme: this.colorSchemeSelect.value || undefined, //string;
			colors: objFromValue('colorsInput'), // string[];
			colorMap: objFromValue('colorMapInput'), // [number, string][];
			levels: objFromValue('levelsInput'), // number[];
			blurRadius: +this.blurRadiusInput.value, //number;
			addDegrees: +this.addDegreesInput.value, //number;
			units: this.unitsInput.value || undefined, //string;
			extraUnits: objFromValue('extraUnitsInput'), // Units; //{ [name: string]: [string, number, ?number] };
			mask: this.maskSelect.value || undefined, // string;
		};

		return style;
	}

	protected _setStyleToTextArea(style: ColorStyleWeak): void {
		this.editorTextAreaEl.value = JSON.stringify(JSONsort(style), null, 2);
	}

	protected _setStyleToDiv(style: ColorStyleWeak): void {
		this.parentInput.value = style.parent || ''; // string;
		this.nameInput.value = style.name || ''; //string;
		this.fillSelect.value = style.fill || ''; //string;
		this.isolineColorSelect.value = style.isolineColor?.[0] === '#' ? 'custom' : style.isolineColor || ''; //string;
		this.isolineColorInput.value = style.isolineColor?.[0] === '#' ? style.isolineColor : ''; //string;
		this.isolineTextInput.checked = style.isolineText || false; //boolean;
		this.vectorTypeSelect.value = style.vectorType || ''; //string;
		this.vectorColorSelect.value = style.vectorColor?.[0] === '#' ? 'custom' : style.vectorColor || ''; //string;
		this.vectorColorInput.value = style.vectorColor?.[0] === '#' ? style.vectorColor : ''; //string;
		this.vectorFactorInput.value = style.vectorFactor?.toString() || '1'; //number;
		this.streamLineColorSelect.value = style.streamLineColor?.[0] === '#' ? 'custom' : style.streamLineColor || ''; //string;
		this.streamLineColorInput.value = style.streamLineColor?.[0] === '#' ? style.streamLineColor : ''; //string;
		this.streamLineSpeedFactorInput.value = style.streamLineSpeedFactor?.toString() || '1'; //number;
		this.streamLineStaticInput.checked = style.streamLineStatic || false; //boolean;
		this.showBelowMinInput.checked = style.showBelowMin || false; //boolean;
		this.showAboveMaxInput.checked = style.showAboveMax || false; //boolean;
		this.colorSchemeSelect.value = style.colorScheme || ''; //string;
		this.colorsInput.value = style.colors?.length ? JSON.stringify(style.colors) : ''; // string[];
		this.colorMapInput.value = style.colorMap?.length ? JSON.stringify(style.colorMap) : ''; // [number, string][];
		this.levelsInput.value = style.levels?.length ? JSON.stringify(style.levels) : ''; // number[];
		this.blurRadiusInput.value = style.blurRadius?.toString() || ''; //number;
		this.addDegreesInput.value = style.addDegrees?.toString() || ''; //number;
		this.unitsInput.value = style.units || ''; //string;
		this.extraUnitsInput.value = style.extraUnits ? JSON.stringify(style.extraUnits) : ''; // Units; //{ [name: string]: [string, number, ?number] };
		this.maskSelect.value = style.mask || ''; // string;
	}

	protected _onDivChange(): void {
		const cleanUp = (obj: any) => {
			Object.keys(obj).forEach((key) => {
				if (obj[key] === undefined) delete obj[key];
			});
			return obj;
		};

		// update text area
		const style = Object.assign(this._getStyleFromTextArea(), cleanUp(this._getStyleFromDiv()));
		this.editorTextAreaEl.value = JSON.stringify(style, null, 2);
		this.onchange?.(this.getStyle());
	}

	protected _onTextChange(): void {
		// update div
		const style = this._getStyleFromTextArea();
		this._setStyleToDiv(style);
		this.onchange?.(this.getStyle());
	}
}
