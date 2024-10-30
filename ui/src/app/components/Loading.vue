<template>
	<div class="d-flex fullheight ai-center jc-center loading" title="Loading...">
		<div class="tw-bold">
			<fa icon="spinner" size="3x" spin></fa>
		</div>
	</div>
</template>

<script>
	import BaseMixin from '../mixins/BaseMixin';
	
	export default{
		mixins: [BaseMixin],
		name: 'Loading'
	}
</script>
