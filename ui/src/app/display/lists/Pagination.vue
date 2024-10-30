<template>
	<div class="gap d-flex">
		<button v-for="(it, i) in Items" 
			class="button medium primary" 
			:disabled="itemProps[i].is_disabled" 
			:class="{primary: itemProps[i].is_selected}"
			@click="handleItemSelect(itemProps[i])">{{ it.name }}</button>
	</div>
</template>

<script>
	import BaseMixin from '../../mixins/BaseMixin';
	import {PaginationMixin} from '../../../libs/list/mixins';
	
	export default {
		mixins: [BaseMixin, PaginationMixin]
	};
</script>
