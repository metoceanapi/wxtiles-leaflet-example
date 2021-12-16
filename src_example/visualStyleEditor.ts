import { ColorStyleStrict } from '@metoceanapi/wxtiles-leaflet';
import { WxGetColorSchemes } from '@metoceanapi/wxtiles-leaflet';

export interface Editor {
	editorDiv: HTMLDivElement;
	parentInput: HTMLInputElement;
	nameInput: HTMLInputElement;
	addDegreesInput: HTMLInputElement;
	blurRadiusInput: HTMLInputElement;
	colorSchemeSelect: HTMLSelectElement;
	fillSelect: HTMLSelectElement;
	maskSelect: HTMLSelectElement;
	isolineColorSelect: HTMLSelectElement;
	isolineColorInput: HTMLInputElement;
	isolineTextInput: HTMLInputElement;
	showAboveMaxInput: HTMLInputElement;
	showBelowMinInput: HTMLInputElement;
	streamLineColorInput: HTMLInputElement;
	streamLineSpeedFactorInput: HTMLInputElement;
	streamLineStaticInput: HTMLInputElement;
	unitsInput: HTMLInputElement;
	vectorColorSelect: HTMLSelectElement;
	vectorColorInput: HTMLInputElement;
	vectorTypeSelect: HTMLSelectElement;
	updateFromStyle: (style: ColorStyleStrict) => void;
	onchange?: (style: ColorStyleStrict) => void;
}

function createEl<K extends keyof HTMLElementTagNameMap>(tag: K, container: HTMLElement, params: any): HTMLElementTagNameMap[K] {
	const el = Object.assign(document.createElement<K>(tag), params);
	container && container.appendChild?.(el);
	return el;
}

function getStyle(e: Editor): ColorStyleStrict {
	const style = {} as ColorStyleStrict;
	style.parent = e.parentInput.value;
	style.name = e.nameInput.value;
	style.fill = e.fillSelect.item(e.fillSelect.selectedIndex)?.value || '';
	style.isolineColor = e.isolineColorSelect.value === 'custom' ? e.isolineColorInput.value : e.isolineColorSelect.value;
	style.isolineText = e.isolineTextInput.checked;
	style.vectorType = e.vectorTypeSelect.item(e.vectorTypeSelect.selectedIndex)?.value || '';
	style.vectorColor = e.vectorColorSelect.value !== 'custom' ? e.vectorColorSelect.value : e.vectorColorInput.value;
	style.streamLineColor = e.streamLineColorInput.value;
	style.streamLineSpeedFactor = +e.streamLineSpeedFactorInput.value;
	style.streamLineStatic = e.streamLineStaticInput.checked;
	style.showBelowMin = e.showBelowMinInput.checked;
	style.showAboveMax = e.showAboveMaxInput.checked;
	style.colorScheme = e.colorSchemeSelect.options.item(e.colorSchemeSelect.selectedIndex)?.value || '';
	style.colors;
	style.colorMap;
	style.levels;
	style.blurRadius = +e.blurRadiusInput.value;
	style.addDegrees = +e.addDegreesInput.value;
	style.units = e.unitsInput.value;
	style.extraUnits;
	style.mask = e.maskSelect.value;

	return style;
}

function fromStyle(e: Editor, style: ColorStyleStrict) {
	if (!e.colorSchemeSelect.options.length) {
		Object.keys(WxGetColorSchemes()).forEach((value) => {
			e.colorSchemeSelect.add(createEl('option', e.colorSchemeSelect, { value, text: value }));
		});
		e.colorSchemeSelect.selectedIndex = 1;
	}

	e.parentInput.value = style.parent || '';
	e.nameInput.value = style.name;

	e.fillSelect.value = style.fill;
	if (style.isolineColor[0] === '#') {
		e.isolineColorSelect.value = 'custom';
		e.isolineColorInput.value = style.isolineColor;
	} else {
		e.isolineColorSelect.value = style.isolineColor;
	}
	e.isolineTextInput.checked = style.isolineText;

	e.vectorTypeSelect.value = style.vectorType;
	if (style.vectorColor[0] === '#') {
		e.vectorColorSelect.value = 'custom';
		e.vectorColorInput.value = style.vectorColor;
	} else {
		e.vectorColorSelect.value = style.vectorColor;
	}

	e.streamLineColorInput.value = style.streamLineColor;
	e.streamLineSpeedFactorInput.value = style.streamLineSpeedFactor + '';
	e.streamLineStaticInput.checked = style.streamLineStatic;
	e.showBelowMinInput.checked = style.showBelowMin;
	e.showAboveMaxInput.checked = style.showAboveMax;
	e.colorSchemeSelect.value = style.colorScheme;
	// style.colors;
	// style.colorMap;
	// style.levels;
	e.blurRadiusInput.value = style.blurRadius + '';
	e.addDegreesInput.value = style.addDegrees + '';
	e.unitsInput.value = style.units;
	// style.extraUnits;
	e.maskSelect.value = style.mask || '';

	console.log('');
}

//ColorStyleStrict
export function createEditor(container: HTMLElement, id = '', className = ''): Editor {
	const e = {} as Editor;
	e.editorDiv = createEl<'div'>('div', container, { id, className });

	const addLabel = (id: string) => {
		createEl<'label'>('label', e.editorDiv, { htmlFor: id, id: id + 'Label', className: id + 'LabelClass', textContent: id });
		createEl<'br'>('br', e.editorDiv, {});
	};

	const addInput = (id: string, type: string, min?: string, max?: string, step?: string) => {
		const el = createEl<'input'>('input', e.editorDiv, { id, className: id + 'Class', type, min, max, step });
		addLabel(id);
		return el;
	};

	const addSelect = (id: string, opts: string[]) => {
		const el = createEl<'select'>('select', e.editorDiv, { id, className: id + 'Class' });
		opts.forEach((name) => el.options.add(createEl('option', el, { value: name, text: name })));
		addLabel(id);
		el.selectedIndex = 0;
		return el;
	};

	e.parentInput = addInput('parentInput', 'text');
	e.nameInput = addInput('nameInput', 'text');
	e.addDegreesInput = addInput('addDegreesInput', 'number', '0', '360', '1');
	e.blurRadiusInput = addInput('blurRadiusInput', 'range', '0', '10', '1');

	e.colorSchemeSelect = addSelect('colorSchemeSelect', []);
	e.fillSelect = addSelect('fillSelect', ['gradient', 'solid', 'none']);
	e.maskSelect = addSelect('maskSelect', ['none', 'sea', 'land']);
	e.isolineColorSelect = addSelect('isolineColorSelect', ['inverted', 'fill', 'none', 'custom']);
	e.isolineColorInput = addInput('isolineColorInput', 'color');
	e.isolineTextInput = addInput('isolineTextInput', 'checkbox');
	e.showAboveMaxInput = addInput('showAboveMaxInput', 'checkbox');
	e.showBelowMinInput = addInput('showBelowMinInput', 'checkbox');
	e.streamLineColorInput = addInput('streamLineColorInput', 'color');
	e.streamLineSpeedFactorInput = addInput('streamLineSpeedFactorInput', 'number', '0.1', '10', '0.1');
	e.streamLineStaticInput = addInput('streamLineStaticInput', 'checkbox');
	e.unitsInput = addInput('unitsInput', 'text');

	e.vectorColorSelect = addSelect('vectorColorSelect', ['inverted', 'fill', 'none', 'custom']);
	e.vectorColorInput = addInput('vectorColorInput', 'color');

	e.vectorTypeSelect = addSelect('vectorTypeSelect', ['arrows', 'barbs', 'none']);

	const onchange = () => {
		e.onchange?.(getStyle(e));
	};

	Object.keys(e).map((key) => {
		if (e[key] instanceof HTMLElement) e[key].addEventListener('change', onchange);
	});

	e.updateFromStyle = (style: ColorStyleStrict) => fromStyle(e, style);

	return e;
}
