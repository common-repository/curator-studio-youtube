<template functional>
	<div class="relative" :class="data.class">
		<carousel 
			:per-page="1" 
			:navigation-enabled="false" 
			:pagination-enabled="false" 
			:adjustable-height="true"
			pagination-color="#fff"
			ref="carousel"
			@transition-end="props.slideChange"
			>
			<slide v-for="(it, i) in props.Items" :key="it.id">
				<div :class="props.cP(['d-flex', 'ai-center', 'jc-center'])">
					<figure>
						<img :src="it.media[0].url" style="max-height:80vh" @load="props.slideChange(null, i)"/>
					</figure>
				</div>
			</slide>
		</carousel>
		<Navigation eid="carousel__navigation" @select="props.select"
			:carousel="props.getCarousel()"
			class="carousel__navigation--static carousel__navigation--static--inside">
		</Navigation>
	</div>
</template>
